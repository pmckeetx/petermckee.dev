---
title: "Building ShrikeDB's Extendible Hash Table"
date: "2026-05-20"
tags: ["Rust", "Databases", "Systems"]
author: "peter"
excerpt: "Why ShrikeDB uses extendible hashing for its keyspace, and how it avoids the stop-the-world rehash that bites most open-addressing tables."
hero: "/assets/HP.webp"
heroAlt: "Diagram of an extendible hash table"
featured: true
draft: false
---

ShrikeDB is a Redis-compatible in-memory database I'm writing in Rust. One of the
first decisions I had to make was how to store the keyspace. A naive `HashMap`
gets you a long way, but once you care about predictable latency under load, the
classic open-addressing table starts to hurt: every so often it doubles in size
and rehashes **every** key at once, stalling the shard.

This post walks through why I reached for **extendible hashing** instead.

## The problem with stop-the-world rehashing

A standard hash table keeps load factor in check by growing. Growing means
allocating a bigger backing array and re-inserting every existing entry. For a
table with millions of keys, that's millions of moves in a single operation.

In a request-serving database, that shows up as a latency spike — a single `SET`
occasionally takes 100x longer than its neighbors because it happened to be the
one that triggered the resize.

> The average case is fine. It's the tail latency that ruins your day.

## How extendible hashing helps

Extendible hashing splits the table into **buckets** referenced through a
**directory**. Instead of rehashing everything, you only ever split a single
overflowing bucket and double the directory (a cheap pointer-array copy).

The key ideas:

- The directory has a **global depth** `d` — it holds `2^d` pointers.
- Each bucket has a **local depth** — how many bits of the hash it actually
  distinguishes.
- When a bucket overflows and its local depth is below the global depth, you
  split just that bucket.
- When local depth equals global depth, you double the directory first, then
  split.

### Splitting a bucket

Here's the core of the split, trimmed down from the real implementation:

```rust
fn split(&mut self, index: usize) {
    let bucket = &mut self.buckets[index];
    let local_depth = bucket.local_depth;

    // Grow the directory if this bucket is as deep as the directory.
    if local_depth == self.global_depth {
        self.double_directory();
    }

    // Two new buckets, one bit deeper.
    let mut lo = Bucket::with_depth(local_depth + 1);
    let mut hi = Bucket::with_depth(local_depth + 1);
    let high_bit = 1 << local_depth;

    for entry in bucket.drain() {
        if entry.hash & high_bit == 0 {
            lo.insert(entry);
        } else {
            hi.insert(entry);
        }
    }

    self.rebind_directory(index, lo, hi, high_bit);
}
```

Only the keys in the overflowing bucket move. Everything else stays put.

## The numbers

A quick comparison of what a single insert costs at the moment the table is
under pressure:

| Strategy            | Worst-case insert | Directory cost      |
| ------------------- | ----------------- | ------------------- |
| Open addressing     | O(n) full rehash  | none                |
| Extendible hashing  | O(bucket size)    | O(2^d) pointer copy |

The bucket is a fixed, small size, so the worst case is bounded by a constant
rather than by the total number of keys. That's exactly the property you want
when you're trying to keep p99 latency flat.

## What's next

The next thing I want to write up is how the per-shard runtime keeps these tables
**shared-nothing** so there's no cross-thread locking on the hot path. If you
want to follow along, the code is open source.
