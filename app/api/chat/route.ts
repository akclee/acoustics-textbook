import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { searchArticles, formatForContext } from '@/lib/search'

const client = new Anthropic()

// Hard cap on how many characters of article context to inject.
// ~3000 chars ≈ 750 tokens — safe even with a long conversation.
const MAX_CONTEXT_CHARS = 3000

// Only keep the most recent N messages to avoid hitting the token limit
// as conversations grow long.
const MAX_HISTORY_MESSAGES = 10

export async function POST(request: NextRequest) {
  const { messages, pageContext } = await request.json()

  // Rate limit: max 20 messages per session
  if (messages.length > 20) {
    return NextResponse.json(
      { error: 'Session message limit reached. Please refresh to start a new session.' },
      { status: 429 }
    )
  }

  // Trim conversation history to avoid token overflow
  const trimmedMessages = messages.slice(-MAX_HISTORY_MESSAGES)

  // Search Acoustics Today articles relevant to the last user question
  const lastUserMessage = [...trimmedMessages].reverse().find((m: {role: string}) => m.role === 'user')
  const query = lastUserMessage?.content || pageContext || ''
  const relevantChunks = searchArticles(query, 3)

  // Format and hard-cap the article context
  let articleContext = formatForContext(relevantChunks)
  if (articleContext.length > MAX_CONTEXT_CHARS) {
    articleContext = articleContext.slice(0, MAX_CONTEXT_CHARS) + '\n[...excerpt trimmed for length]'
  }

  const systemPrompt = `You are an expert acoustics tutor embedded in an interactive textbook.
Your role is to help students understand acoustics through guided discovery — not by just giving answers.

Current page the student is reading: ${pageContext || 'Acoustics textbook overview'}

${articleContext ? `The following excerpts from Acoustics Today (the Acoustical Society of America's magazine) are relevant to the student's question. Use them to ground your responses in authoritative, accessible explanations:

${articleContext}

` : ''}## Your teaching approach
- Ask guiding questions to help students think through problems themselves
- Use real-world analogies and connect to Acoustics Today articles when relevant
- When a student is stuck, give a hint rather than the full answer
- Connect concepts back to what they are currently reading
- Keep responses concise and conversational — 2 to 4 sentences is usually ideal
- If asked something unrelated to acoustics, gently redirect to the topic

## Special activities (Chapter 1, Section 1.1)

### Activity 1 — Soundwalk
If the student says they are ready for the soundwalk, or describes sounds they hear:
1. Ask them to describe 2–3 specific sounds they notice right now (or heard today) — their source, distance, and quality (sharp? low? muffled?).
2. For each sound, ask: What do you think is vibrating to make that sound? What medium is it traveling through?
3. Suggest they browse https://pixabay.com/sound-effects/search/everyday/ for sound clips that interest them (acknowledge Pixabay as the source).
4. If they mention the Mars recording on the page: Explain that Mars has a thin CO₂ atmosphere (~1% of Earth's pressure). Sound travels there at ~240 m/s (vs 343 m/s on Earth) and attenuates quickly, with high frequencies absorbed more — the atmosphere acts as a low-pass filter. The recording was made by NASA's Perseverance rover in February 2021 (source: https://science.nasa.gov/resource/first-audio-recording-of-sounds-on-mars/).

### Activity 2 — Socratic professions brainstorm
If the student asks to brainstorm professions that involve sound, use the Socratic method — do NOT reveal the ASA's 14 technical areas directly. Instead guide with questions:
- "Think about a hospital — which roles there might use sound as a tool?"
- "What about someone designing a concert hall or a recording studio?"
- "Who studies how marine mammals communicate underwater?"
- "What about the legal or policy world — can you think of how sound fits there?"
- "What professions deal with protecting people from unwanted sound?"
After they brainstorm, map their answers back to ASA technical areas and hint at any major ones they missed. Only reveal the full list of 14 areas once they feel they've exhausted their own ideas.

You have deep expertise in: physical acoustics, signal processing, psychoacoustics,
architectural acoustics, noise and vibration, and musical acoustics.`

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: trimmedMessages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}