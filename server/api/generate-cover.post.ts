export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.openaiApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing OPENAI_API_KEY in runtimeConfig.'
    })
  }

  const body = await readBody(event).catch(() => ({}))
  const { prompt, poemTitles, poetName } = body || {}

  const titles = (poemTitles || []).slice(0, 10).join(', ')

  const suffix = ''

  const defaultPrompt = `
  Single minimalist book cover design.

ONE single flat image only.
No mockup.
No wall.
No multiple posters.
No frames.
No presentation layout.
No shadows.
No 3D rendering.

Soft light gray solid background.
Top 35% completely empty, solid background only.

All abstract shapes and botanical elements placed only in lower 65%.
Muted sage green, beige and mustard.
Flat vector style.
Clean Scandinavian design.
Vertical 2:3 book cover ratio.
Professional publishing layout.

Centered single page composition.
Full-bleed flat design.
No duplicated layout.
No side-by-side images.


  `

  const autoPrompt = `${defaultPrompt} ${suffix}`

  try {
    const res = await $fetch<{ data: Array<{ b64_json: string, revised_prompt: string }> }>(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          model: 'dall-e-3',
          prompt: autoPrompt,
          n: 1,
          size: '1024x1792',
          response_format: 'b64_json'
        }
      }
    )

    const image = res?.data?.[0]
    if (!image?.b64_json) {
      throw new Error('No image data returned from DALL-E')
    }

    return {
      ok: true,
      imageBase64: image.b64_json,
      revisedPrompt: image.revised_prompt
    }
  } catch (e: any) {
    console.error('Error generating cover:', e)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to generate cover image.',
      data: { message: e?.message ?? String(e) }
    })
  }
})
