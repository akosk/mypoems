export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file uploaded.'
    })
  }

  const file = formData.find(f => f.name === 'cover')
  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing "cover" file field.'
    })
  }

  const allowedTypes = ['image/jpeg', 'image/png']
  if (!file.type || !allowedTypes.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only JPEG and PNG images are allowed.'
    })
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.data.length > maxSize) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File size exceeds 10MB limit.'
    })
  }

  const imageBase64 = file.data.toString('base64')

  return {
    ok: true,
    imageBase64
  }
})
