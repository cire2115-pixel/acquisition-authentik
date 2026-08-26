import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function callLLM(systemPrompt: string, userMessage: string): Promise<string> {
  const model = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4-5'
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })
  const raw = response.choices[0].message.content ?? '{}'
  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
}