---
title: "Connect a phone number to a Dialog-RSN-1 voice agent with Twilio and Python"
date: "2026-11-25"
tags: ["Voice AI", "Python", "Twilio", "Realtime API"]
author: "peter"
excerpt: "Answer a Twilio phone number with a Dialog-RSN-1 voice agent: one Python file bridges the call, converts the audio for the phone line and handles barge-in."
hero: "/assets/blog/connect-a-phone-number-to-a-dialog-rsn-1-voice-agent.png"
heroAlt: "A phone call to Copperline Plumbing: the caller asks about a night callout, talks over the answer, and the assistant stops and answers the new question"
featured: false
draft: false
---

At seven on a Sunday evening, water starts dripping through a kitchen ceiling in Aurora, Colorado. The homeowner rings Copperline Plumbing, and an assistant called Rosa picks up. She tells them to turn off the main water valve first, explains that an emergency callout outside office hours costs 180 dollars for the first hour, and when the caller cuts in with "Sorry, how much?" she stops talking and answers the question they actually asked.

A phone agent like Rosa usually takes three services and a good deal of glue code. Speech-to-text turns the caller's audio into words, a language model writes the reply, and text-to-speech reads it out, while your own code decides when the caller has finished, usually with a silence timer, keeps the conversation history and works out what to do when the caller interrupts. That turn-taking logic is the hardest part to get right on a real phone line, where callers pause to find a number and talk over the agent.

In this guide, you will build Rosa with Twilio Voice for the phone line and PolyAI's Dialog-RSN-1 API for the conversation. The code is in [pmckeetx/dialog-rsn-1-twilio](https://github.com/pmckeetx/dialog-rsn-1-twilio). Dialog-RSN-1 hears the caller's audio directly, decides when they have finished and writes the reply, and the API speaks that reply in a server-side voice, so the server you write only carries audio between Twilio and the API. It fits in one Python file of under 200 lines, including Rosa's 18-line prompt.

In test calls, Rosa started answering about a second after the caller stopped talking. Those calls ran through `fake_call.py`, a script in the repository that plays the part of Twilio, and at the time of writing (November 2026) I have not yet run this code on a live Twilio line.

## What you'll build

By the end of this guide, you will have a FastAPI server that answers Twilio's incoming call webhook and streams the call to itself over Twilio Media Streams. Inside it, a bridge forwards the caller's audio to Dialog-RSN-1 untouched, converts each spoken reply for the phone line, and stops playback when the caller talks over the agent. The agent is Rosa, a phone assistant for a fictional Denver plumber who knows the office hours, the prices and the service area, and what to tell a caller with a burst pipe.

## How it works

Dialog-RSN-1 removes most of the glue code. It takes the caller's audio directly, confirms when their turn has ended, and transcribes the turn and writes the reply in the same pass, while the session keeps the conversation history. The API then voices the reply with server-side text-to-speech and streams the audio back. Your server only has to carry audio in each direction:

```text
Caller's phone     Twilio Media Streams       Your server (main.py)          PolyAI realtime API
     | --voice-->  8 kHz mu-law --mu-law-->   forwards it untouched --mu-law-->  Dialog-RSN-1 hears and
     | <--voice--  8 kHz mu-law <--mu-law--   24 kHz PCM to mu-law  <--PCM 24k--  writes, the API voices it
```

There is exactly one audio conversion. Twilio Media Streams carry 8 kHz mu-law (G.711) in both directions. Dialog-RSN-1 accepts mu-law as input without conversion, but the API returns its spoken replies as 24 kHz PCM, so your server turns each reply back into 8 kHz mu-law before Twilio plays it.

## Prerequisites

To follow along, you will need Python 3.13 or later and [uv](https://docs.astral.sh/uv/). uv installs Python 3.13 for you if you do not have it, and it installs the dependencies from the lockfile, so your setup matches mine.

You will also need a Dialog-RSN-1 API key. Sign up or log in at [studio.poly.ai](https://studio.poly.ai), then create a key in the **API Keys** tab. The API bills per connected minute plus tokens; at the time of writing that is $0.02 a minute, billed per second, and the [limits and pricing page](https://docs.poly.ai/api-reference/dialog-rsn-1/limits) has the current rates.

On the phone side, you need an upgraded Twilio account and a phone number with voice. A free trial is not enough for this guide: trial accounts strip the `<Stream>` verb out of your TwiML and play "The Stream verb is not available on trial accounts" instead, according to [Twilio's trial documentation](https://www.twilio.com/docs/usage/trials/try-out-voice). For a US number, [Twilio's voice pricing](https://www.twilio.com/en-us/voice/pricing/us) at the time of writing is $1.15 a month for the number, $0.0085 a minute for inbound calls and $0.0044 a minute for Media Streams.

Finally, Twilio has to reach your server from the internet, so you need [ngrok](https://ngrok.com) or another way to give your laptop a public HTTPS address. A free ngrok account works. Run `ngrok config add-authtoken` with the token from your ngrok dashboard once before you start.

## Step 1: Set up the project

Start by creating an empty project and adding its dependencies:

```bash
uv init --bare dialog-rsn-1-twilio --python 3.13
cd dialog-rsn-1-twilio
uv add fastapi uvicorn websockets python-dotenv numpy soxr audioop-lts
```

`uv init --bare` creates a folder holding only a `pyproject.toml`, and `--python 3.13` sets the minimum Python version. Without `--bare`, recent versions of uv create a packaged project with a `src/` folder, which this guide does not use: all the code goes in a single `main.py` in the project folder. `uv add` installs each package into the project's virtual environment and records it in `pyproject.toml` and the lockfile.

FastAPI and uvicorn run the web server, which has one webhook and one WebSocket endpoint. `websockets` is the client for the connection to Dialog-RSN-1, and `python-dotenv` reads your key from a `.env` file. numpy and soxr resample the reply audio from 24 kHz down to 8 kHz, and `audioop-lts` encodes it as mu-law. The `audioop` module was removed from Python's standard library in 3.13, and this package is the same module, maintained separately.

Next, create a `.env` file in the project folder:

```text
POLY_API_KEY=your-key-from-studio.poly.ai
PORT=5050
```

`POLY_API_KEY` is the key you created at studio.poly.ai. `PORT` is the port the server listens on, and 5050 matches the ngrok command in Step 9.

If you would rather skip ahead, clone the finished project instead, copy the example settings and add your key to `.env`:

```bash
git clone https://github.com/pmckeetx/dialog-rsn-1-twilio
cd dialog-rsn-1-twilio
cp .env.example .env
uv sync
```

`uv sync` creates the virtual environment and installs the exact versions recorded in the repository's lockfile.

## Step 2: Add the settings and the agent's prompt

Everything lives in one file. Create `main.py` in the project folder and start it with the imports and settings:

```python
import asyncio
import base64
import json
import os

import audioop
import numpy as np
import soxr
import uvicorn
import websockets
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import Response
from starlette.websockets import WebSocketDisconnect

load_dotenv()

POLY_API_KEY = os.environ.get("POLY_API_KEY")
DIALOG_REALTIME_URL = os.environ.get("DIALOG_REALTIME_URL", "wss://api.studio.poly.ai/v1/realtime")
PORT = int(os.environ.get("PORT", 5050))

if not POLY_API_KEY:
    raise SystemExit("POLY_API_KEY is not set. Copy .env.example to .env and add your key from studio.poly.ai.")

# A Cartesia voice id. This one is "Katie" (US English). Any Cartesia voice id works here.
VOICE = "f786b574-daa5-4673-aa0c-cbe3e8534c02"
```

The imports hold no surprises. `DIALOG_REALTIME_URL` defaults to the public endpoint, `wss://api.studio.poly.ai/v1/realtime`, which is where keys from studio.poly.ai connect; you only change it for an enterprise key from studio.us.poly.ai (see the troubleshooting table). The server exits at startup when the key is missing, so a missing `.env` fails loudly in the terminal instead of as a silent phone call.

`VOICE` is a [Cartesia](https://www.cartesia.ai) voice id. The API voices replies through Cartesia on PolyAI's side, so you do not need a Cartesia account, and you can leave the voice out of the session entirely to get the default voice.

Rosa herself comes next in `main.py`, just below the settings:

```python
INSTRUCTIONS = """You are Rosa, who answers the phone for Copperline Plumbing in Denver, Colorado.

Everything you say is spoken on a phone call. Keep each reply to one or two short sentences.
Never use lists, markdown, emoji or URLs. Say prices and times the way a person would.

When the call starts, say "Thanks for calling Copperline Plumbing, this is Rosa. How can I help?"

What you know:
- Office hours are 7 AM to 6 PM, Monday to Saturday. Closed Sunday.
- Emergency callouts run 24 hours a day, every day, for burst pipes, major leaks and no hot water.
- A standard visit costs 95 dollars for the first hour, then 60 dollars per half hour.
- An emergency callout outside office hours costs 180 dollars for the first hour.
- The service area is Denver, Aurora, Lakewood and Englewood.
- For anything you can't answer, offer to have a plumber call them back, and ask for their name
  and number. Read the number back to confirm it.

If the caller describes water coming through a ceiling or a burst pipe, tell them to turn off the
main water valve first, then offer an emergency callout."""


app = FastAPI()
```

Write the instructions for the ear. A reply that reads well as a bulleted list sounds wrong on a phone, so the prompt asks for one or two short sentences with no formatting, and it tells Rosa to say prices and times the way a person would. `app` is the FastAPI application that the next steps add routes to.

The prompt also gives Rosa an opening line, because she speaks first. The model writes that greeting from the instruction, so it usually comes out as written, but the exact wording is not guaranteed. If a business needs a fixed greeting, such as a compliance line, set `poly_first_assistant_message` in the session instead and remove the `response.create` you will add in Step 4: the API says that text word for word as its own first reply, and a `response.create` sent at the start would get a second assistant turn straight after it.

## Step 3: Answer the call with TwiML

When someone calls your number, Twilio asks your server what to do with the call, and your server answers in TwiML, Twilio's XML for call instructions. Add the webhook to the end of `main.py`:

```python
@app.post("/incoming-call")
async def incoming_call(request: Request):
    """Answer the call by connecting it to our media stream."""
    host = request.url.hostname
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://{host}/media-stream" />
  </Connect>
</Response>"""
    return Response(content=twiml, media_type="application/xml")
```

`<Connect><Stream>` opens a bidirectional media stream: Twilio connects to your WebSocket, sends the caller's audio over it, and plays whatever audio you send back. `host` is the address Twilio used to reach the webhook, so the stream URL follows your ngrok address without any configuration.

## Step 4: Open a Dialog-RSN-1 session for each call

Each call gets its own WebSocket from Twilio and its own session on Dialog-RSN-1. Add the start of the media stream handler to the end of `main.py`:

```python
@app.websocket("/media-stream")
async def media_stream(twilio: WebSocket):
    """Bridge one phone call to one Dialog-RSN-1 session, both ways, until either side hangs up."""
    await twilio.accept()

    # Twilio sends "connected", then "start", which names the stream every reply must address.
    stream_sid = None
    while stream_sid is None:
        event = json.loads(await twilio.receive_text())
        if event["event"] == "start":
            stream_sid = event["start"]["streamSid"]
            print(f"[call] started {event['start']['callSid']}")

    async with websockets.connect(
        DIALOG_REALTIME_URL,
        additional_headers={"Authorization": f"Bearer {POLY_API_KEY}"},
    ) as poly:
        await poly.send(json.dumps({
            "type": "session.update",
            "session": {
                "type": "realtime",
                "instructions": INSTRUCTIONS,
                "audio": {
                    # The phone line's own format. No conversion on the way in.
                    "input": {"format": {"type": "audio/pcmu"}},
                    "output": {"voice": VOICE},
                },
            },
        }))
        # Ask for a reply straight away, so Rosa answers the phone.
        await poly.send(json.dumps({"type": "response.create"}))
```

The handler first waits for Twilio's `start` event, because it carries the `streamSid` that every message sent back to Twilio has to name. It then opens a WebSocket to Dialog-RSN-1, with the key in a bearer `Authorization` header, and configures the session with a single `session.update`.

For a phone line, the input format is the setting to get right. `audio/pcmu` is mu-law at a fixed 8 kHz, which is what Twilio sends, so the session needs no sample rate and the audio needs no conversion on the way in. `voice` picks Rosa's voice. Spoken replies have been the default for a new session since 13 October 2026, so the update does not set `output_modalities`.

Turn detection needs no settings at all. The API listens to everything you stream, and Dialog-RSN-1 decides when the caller has finished, so a short pause while they look for their account number usually does not end their turn.

The `response.create` sent straight after the update asks for a reply before the caller has said anything, and that is what makes Rosa answer the phone. Without it, the line stays silent until the caller speaks.

## Step 5: Send the caller's audio to Dialog-RSN-1

The caller's side of the bridge is a straight copy. This function goes inside the handler, below the `response.create`:

```python
        async def caller_to_agent():
            """Forward the caller's audio to Dialog-RSN-1, untouched."""
            try:
                while True:
                    event = json.loads(await twilio.receive_text())
                    if event["event"] == "media":
                        await poly.send(json.dumps({
                            "type": "input_audio_buffer.append",
                            "audio": event["media"]["payload"],
                        }))
                    elif event["event"] == "stop":
                        print("[call] caller hung up")
                        return
            except WebSocketDisconnect:
                return
```

Each Twilio `media` event carries a short chunk of base64 mu-law, and the function puts that payload into an `input_audio_buffer.append` event exactly as it arrived. A `stop` event means the caller hung up, and a dropped WebSocket ends the loop too.

Twilio streams the whole call, silence included, and that is what Dialog-RSN-1 needs, because it judges the end of a turn from the audio itself. Do not trim silence, clean up noise or run your own speech detection in front of it.

## Step 6: Convert the reply for the phone line

The API streams each spoken reply as `response.output_audio.delta` events, each one carrying base64 PCM16 audio, mono, at 24 kHz. Twilio only plays 8 kHz mu-law, so every chunk has to be resampled and then encoded. Add this class to `main.py` at the top level, just below `app = FastAPI()` and above the webhook from Step 3:

```python
class PhoneAudio:
    """Converts one reply at a time from 24 kHz PCM16 to 8 kHz mu-law, the only format Twilio plays."""

    def __init__(self):
        self.response_id = None
        self.resampler = None

    def start(self, response_id):
        # A fresh resampler per reply, so no filter state leaks from a cancelled one.
        self.response_id = response_id
        self.resampler = soxr.ResampleStream(24000, 8000, 1, dtype="int16")

    def convert(self, delta):
        pcm_24k = np.frombuffer(base64.b64decode(delta), dtype=np.int16)
        pcm_8k = self.resampler.resample_chunk(pcm_24k)
        return base64.b64encode(audioop.lin2ulaw(pcm_8k.tobytes(), 2)).decode()
```

`start()` runs at the beginning of every reply and creates a fresh resampler, so no filter state carries over from a reply the caller cut off. The arguments to `soxr.ResampleStream` are the input rate, the output rate, the number of channels (1, since the audio is mono) and the sample type, 16-bit integers. `convert()` decodes one chunk, resamples it, and encodes the result with `audioop.lin2ulaw`, where the `2` says each input sample is two bytes wide. The output is the standard G.711 mu-law encoding, returned as base64 for Twilio.

`audioop` also has a resampler, `ratecv`, but it is the wrong tool here. An 8 kHz stream can only hold frequencies up to 4 kHz, so going from 24 kHz to 8 kHz means filtering out everything above 4 kHz first. `ratecv` does not filter, and those higher frequencies fold back into the phone band, where they sound like a harsh fizz on every "s". I checked by pushing a 9 kHz tone through both (last re-run on 24 November 2026): `ratecv` passed all of it through as a 1 kHz alias, and soxr removed more than 99.9% of it. `ResampleStream` also keeps its filter state between chunks, so the joins between deltas are clean.

## Step 7: Stop playback when the caller talks over Rosa

This loop is the other direction of the bridge. It also goes inside the handler, below `caller_to_agent`, and it reads every event from Dialog-RSN-1, sends converted audio to Twilio and handles barge-in:

```python
        async def agent_to_caller():
            """Turn Dialog-RSN-1's replies into phone audio, and stop playback on a barge-in."""
            to_phone = PhoneAudio()
            interrupted = set()  # responses the caller talked over
            async for message in poly:
                event = json.loads(message)
                match event["type"]:
                    case "response.output_audio.delta":
                        if event["response_id"] in interrupted:
                            continue
                        await twilio.send_json({
                            "event": "media",
                            "streamSid": stream_sid,
                            "media": {"payload": to_phone.convert(event["delta"])},
                        })

                    # Sent when the caller starts a turn. If Rosa was speaking, the server is cancelling
                    # her reply. Twilio still holds the audio we sent ahead, so tell it to drop that too.
                    case "input_audio_buffer.speech_started":
                        if to_phone.response_id:
                            interrupted.add(to_phone.response_id)
                        await twilio.send_json({"event": "clear", "streamSid": stream_sid})

                    case "response.created":
                        to_phone.start(event["response"]["id"])
                    case "response.done":
                        to_phone.start(None)

                    case "conversation.item.input_audio_transcription.completed":
                        print(f"[caller] {event['transcript']}")
                    case "response.output_audio_transcript.done":
                        print(f"[rosa]   {event['transcript']}")
                    case "error":
                        print(f"[error]  {event['error']['code']}: {event['error']['message']}")
```

`response.created` and `response.done` bracket each reply, so `PhoneAudio` starts a fresh resampler for every one, and each `response.output_audio.delta` is converted and sent to Twilio as a `media` message addressed to the stream. The two transcript events print both sides of the call to the terminal, and `error` prints anything the API refuses.

Barge-in takes two moves, and the API makes the first one. While Rosa is speaking, PolyAI's server keeps asking Dialog-RSN-1 whether the caller is really taking the turn, using several signals to choose when to ask, including helper voice activity detectors, regular intervals and timeouts. A short "mm-hmm" usually does not interrupt her. Once the model decides the caller has the turn, the API sends `input_audio_buffer.speech_started` and cancels the reply.

Echo is the case to watch. Dialog-RSN-1 is not yet reliable at ignoring Rosa's own voice when it comes back down the line, and in my own tests in October 2026, feeding a reply back in as input at 5 to 50 percent volume made it cut itself off in 15 of 15 replies. Phone handsets usually cancel echo themselves, but a caller on a speakerphone with poor echo cancellation can make Rosa interrupt herself.

The second move belongs to your bridge. The API streams audio slightly ahead of playback, and Twilio buffers what it has received, so cancelling the reply does not silence the phone by itself. The Twilio `clear` message empties that buffer, and the `interrupted` check at the top of the loop drops any audio for the cancelled reply that is still in flight. In the test call later in this guide, the `clear` dropped 322 ms of Rosa's audio that was still waiting to play.

The bridge does not track playback for the history, as you might with OpenAI's Realtime API, because the API sends reply audio at about playing speed and, on a barge-in, cuts the reply in its history to the point it estimates the caller had heard. When the caller says "sorry, what was that?", Rosa knows roughly where she got to. That estimate assumes audio plays as soon as Twilio receives it, and the phone network adds a little delay after that, so the history can hold a word or two the caller did not hear. If you need it exact, track playback with Twilio `mark` messages and send [`conversation.item.truncate`](https://docs.poly.ai/api-reference/dialog-rsn-1/reference) with the milliseconds that actually played.

## Step 8: End the call when either side hangs up

The last lines of the handler run both directions at once, and the end of the file starts the server:

```python
        # When either side ends, end the other.
        tasks = [asyncio.create_task(caller_to_agent()), asyncio.create_task(agent_to_caller())]
        await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in tasks:
            task.cancel()
    await twilio.close()
    print("[call] ended")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
```

The first four lines sit inside the `async with` block, at the same indentation as the two functions above them. `asyncio.wait` with `FIRST_COMPLETED` returns as soon as one direction finishes: `caller_to_agent` returns when the caller hangs up, and `agent_to_caller` ends if the Dialog-RSN-1 session closes. The handler then cancels the other task, and leaving the `async with` block closes the Dialog-RSN-1 session before the Twilio socket is closed. The final two lines are at the top level of the file: `uvicorn.run` listens on every interface, on the port from `.env`.

## Step 9: Run the server and connect your Twilio number

Start the server:

```bash
uv run main.py
```

```text
INFO:     Started server process [95524]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5050 (Press CTRL+C to quit)
```

In a second terminal, give it a public address:

```bash
ngrok http 5050
```

Copy the `https://` forwarding address that ngrok prints, for example `https://abc123.ngrok-free.app`. On a free account, ngrok gives you one dev domain that stays the same when you restart it.

Now point your Twilio number at that address. In the [Twilio Console](https://console.twilio.com), open **Numbers & senders**, click your number, and edit its configuration details. Under **Voice and emergency address**, choose **Use Webhooks**, set the incoming call URL to your ngrok address followed by `/incoming-call` (for example `https://abc123.ngrok-free.app/incoming-call`) with the method **HTTP POST**, and save. In the Legacy Console, the same setting is under **Phone Numbers**, **Manage**, **Active numbers**, then **Voice Configuration** on your number, where **A call comes in** takes the webhook URL.

## Step 10: Call Rosa

Call your Twilio number, and Rosa answers. Ask about Saturday hours, or what a night callout costs. Then ask something with a long answer and talk over her before she finishes.

The server prints both sides of the call. Here is its log from a test call made with `fake_call.py`, which the next section covers:

```text
[call] started CAfake
[rosa]   Thanks for calling Copperline Plumbing, this is Rosa. How can I help?
[caller] Hi, what are your hours on Saturday?
[rosa]   We're open from 7 AM to 6 PM on Saturdays. Can I help you with anything else?
[caller] How much is an emergency callout at night, and what areas do you cover?
[rosa]   An emergency callout outside of office hours is 180 dollars for the first hour. We cover Denver, Aurora, Lakewood, and Englewood. Did you need help with something specific?
[caller] Sorry, actually just the price is fine.
[rosa]   An emergency callout outside of office hours is 180 dollars for the first hour. Can I help you with anything else?
[call] caller hung up
[call] ended
```

The caller talked over the answer about callouts. The log shows the whole reply because the API sends the text of a reply ahead of its audio. What the caller heard, and what Dialog-RSN-1 keeps in its history, stops roughly where they interrupted.

In two test calls on 22 October 2026, against `api.studio.poly.ai` with no phone network in the way, Rosa started answering 0.82 to 1.07 seconds after the caller's audio ended. On the barge-in, your bridge sent the `clear` 0.87 seconds after the caller started talking over her.

## Test without a phone

The repository includes `fake_call.py`, which plays the part of Twilio. It connects to `/media-stream`, sends the same `start` and `media` messages Twilio does, speaks three lines as the caller, talks over Rosa's second answer, and plays her replies at phone speed. With the server running, start it in a second terminal:

```bash
uv run fake_call.py
```

```text
  1.72s  Rosa answers (greeting)
  5.96s  caller: Hi, what are your hours on Saturday?
  9.04s  Rosa replies, 0.82s after the caller's audio ended
 14.32s  caller: How much is an emergency callout at night, and what areas do you cover?
 19.31s  Rosa replies, 1.02s after the caller's audio ended
 21.31s  caller: Sorry, actually, just the price is fine.  (talking over Rosa)
 22.18s  clear: dropped 322 ms of queued audio
 25.19s  Rosa replies to the interruption
saved call.wav; barge-in cleared playback
```

> [!NOTE] macOS only
> `fake_call.py` speaks the caller's lines with the macOS `say` command, so it runs on a Mac. On Linux or Windows, use a real call or the offline tests below.

The script saves the call to `call.wav`, with the caller on the left channel and Rosa on the right, so you can hear exactly what a caller would. It is the quickest way to check a prompt change without picking up your phone, and the timings in this guide come from it.

The repository also has offline tests, which run the bridge against a fake Dialog-RSN-1 server and need no key:

```bash
uv run pytest
```

```text
3 passed, 1 warning in 0.19s
```

The tests check that the webhook points the stream at the right host, that the conversion produces a third as many samples, and that a barge-in sends `clear` and drops the cancelled reply's audio. The warning is a deprecation notice from Starlette's test client.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| "An application error has occurred" when you call | Twilio can't reach `/incoming-call` | Check that ngrok is running and the webhook URL ends in `/incoming-call`, with HTTP POST |
| The call plays "The Stream verb is not available on trial accounts" | Your Twilio account is a trial | Upgrade the account: trials strip `<Stream>` from TwiML |
| The call connects, then hangs up, and the server log shows `InvalidStatus: server rejected WebSocket connection: HTTP 401` | The key is wrong, or it's an enterprise key from studio.us.poly.ai used against `api.studio.poly.ai` | Check the key at [studio.poly.ai](https://studio.poly.ai). For an enterprise key, set `DIALOG_REALTIME_URL` to `wss://api.us.poly.ai/v1/realtime` |
| The call connects, then hangs up, with `HTTP 429` in the server log | Either your account has its maximum number of concurrent sessions open, or the key opened too many new connections this minute | Wait for a call to end, or for the time in the `Retry-After` header; the caps are on the [limits and pricing page](https://docs.poly.ai/api-reference/dialog-rsn-1/limits) |
| `fake_call.py` waits, then prints `TimeoutError: no reply` | The server couldn't open a Dialog-RSN-1 session | Read the server's terminal, which shows the real error, usually the 401 above |
| Silence after the call connects, and no errors | `response.create` is missing, so Rosa waits for the caller | Keep the `response.create` after `session.update`, or say something first |
| Rosa sounds like a chipmunk, or very slow | Audio converted at the wrong rate | Resample from 24000 to 8000: Twilio plays only 8 kHz mu-law |
| Loud static on Rosa's voice | PCM sent to Twilio without mu-law encoding, or with a WAV header | Encode with `audioop.lin2ulaw` and send raw bytes only |
| Rosa doesn't hear the caller | The session's input format isn't `audio/pcmu` | Set `audio.input.format` to `{"type": "audio/pcmu"}` |
| Rosa keeps talking after you interrupt | The `clear` message is missing or has the wrong `streamSid` | Send `{"event": "clear", "streamSid": ...}` on `speech_started` |
| `audio_synthesis_failed` in the log | `VOICE` isn't a real Cartesia voice id | Use a valid id, or remove `voice` from `audio.output` for the default |

## Before you take real calls

This is a getting-started build, and a few things need doing before you give the number out.

Start by validating Twilio's signature. Anyone who finds `/incoming-call` can call it, and every connection to `/media-stream` opens a Dialog-RSN-1 session on your key, which you pay for by the minute. Twilio signs both the webhook and the WebSocket handshake with an `X-Twilio-Signature` header, so check both with `RequestValidator` from the `twilio` package and your Twilio auth token, as [Twilio's security guide](https://www.twilio.com/docs/usage/security) describes, and refuse a connection that fails before you open a session.

The concurrency cap needs a plan too. At the time of writing, a self-serve account can hold 2 concurrent sessions on the sign-up credit and 10 once a card is on file, and the handshake is refused with `429` above that. When the bridge cannot open a session, play a polite message with `<Say>` after `<Connect>` instead of leaving the caller in silence: Twilio runs the next TwiML verb once your WebSocket closes.

For production, run the server on a host that stays up, with its own HTTPS address, so the webhook does not depend on your laptop and an ngrok session.

Finally, tell callers they are speaking to an AI assistant, which Rosa's greeting does not do yet, and check the rules on AI disclosure and call recording where your callers are. This server records nothing itself, but if you turn on recording in Twilio or save audio from the bridge, callers have to be told.

## Where to go next

You now have a phone number that a Dialog-RSN-1 agent answers, with barge-in handled in a few lines and no turn-taking logic of your own.

From here, give Rosa tools: add `tools` to the `session.update`, handle the `function_call` items in `agent_to_caller`, and she can check a calendar or book a callout, with prompts for it in the [tool calling guide](https://docs.poly.ai/dialog-rsn-1/prompting/tools). The [turn-taking guide](https://docs.poly.ai/dialog-rsn-1/prompting/turn-taking) shows how to describe your callers in plain language, for example that they often read out long account numbers. To use a voice of your own, set `output_modalities` to `["text"]` and speak the reply with your own text-to-speech, as the [Cartesia voice agent guide](https://docs.poly.ai/dialog-rsn-1/guides/voice-agent-cartesia) does. Every event and field is in the [Dialog-RSN-1 API reference](https://docs.poly.ai/api-reference/dialog-rsn-1/reference).

Clone [pmckeetx/dialog-rsn-1-twilio](https://github.com/pmckeetx/dialog-rsn-1-twilio), point your Twilio number at it, and give Rosa a call.
