import { getAnthropicKey } from './apiKeys'

const VISION_MODEL = 'claude-opus-4-5'

export async function analyzeImage(file) {
  const apiKey = getAnthropicKey()
  if (!apiKey) throw new Error('No Anthropic API key set')

  const base64 = await fileToBase64(file)
  const mediaType = file.type || 'image/jpeg'

  const prompt = `This image was uploaded to VELA — an overlanding expedition app. Analyze it carefully for any of these common overlanding document types:

- Campsite/reservation confirmation
- Land use permit (BLM, USFS, NPS, state)
- QR code (describe what it likely links to)
- Trail or topographic map
- Gate code sign or access instructions
- Vehicle registration or insurance card
- Road condition or closure notice
- Campfire restriction notice
- Emergency contact or ranger station info
- Waypoint or GPS coordinate notation

EXTRACTION INSTRUCTIONS:
1. Extract ALL visible text verbatim — every word, number, code, and date
2. Extract any numbers that look like:
   - Confirmation numbers
   - Permit numbers
   - Gate codes or combinations
   - GPS coordinates
   - Phone numbers
   - Dates and times
3. Read any QR codes if visible and describe their likely purpose
4. For maps: describe the area shown, any labeled roads, trails, or landmarks

FORMAT YOUR RESPONSE AS:
EXTRACTED TEXT:
[all verbatim text found in the image]

DOCUMENT TYPE: [your best guess]

DESCRIPTION:
[2-3 sentence description of what this document shows and why it matters for an overlanding trip]

KEY INFO:
[bullet list of the most important actionable items — codes, dates, locations, restrictions]`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content?.[0]?.text ?? ''
}

export async function analyzePDFText(extractedText) {
  const apiKey = getAnthropicKey()
  if (!apiKey) throw new Error('No Anthropic API key set')

  const prompt = `This document was uploaded to VELA — an overlanding expedition app.

Extract ALL text content verbatim. Pay special attention to:
- Permit numbers and confirmation codes
- Valid dates and expiration dates
- Location names, road names, coordinates
- Restrictions (campfire, vehicle, camping)
- Contact numbers for rangers/emergencies
- Any GPS coordinates or waypoints
- Fee amounts and payment confirmations

Return the complete extracted text with no summarization — every word matters for search.

DOCUMENT TEXT:
${extractedText}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content?.[0]?.text ?? ''
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
