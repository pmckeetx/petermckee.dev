---
title: "Notes on Async Rust (Draft)"
date: "2026-05-25"
tags: ["Rust", "Async"]
author: "peter"
excerpt: "Scratch notes on pinning, cancellation, and structured concurrency in async Rust. Still a work in progress."
featured: false
draft: true
---

This one is still cooking — published only in development so I can preview the
layout. A few things I want to cover:

## Pinning

Why `Pin` exists and why you rarely touch it directly.

## Cancellation

Dropping a future cancels it. That sounds simple until you have a half-written
buffer.

## Structured concurrency

`JoinSet`, scoped tasks, and keeping cancellation tidy.
