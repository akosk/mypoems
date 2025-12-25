export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const resumeUrl = String(body?.resumeUrl || '').trim();

  if (!resumeUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing resumeUrl in body.',
    });
  }

  try {
    const res = await $fetch(resumeUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body?.data ?? body,
    });

    return { ok: true, data: res };
  } catch (e: any) {
    console.error('Error resuming n8n execution:', e);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to resume n8n execution.',
      data: { message: e?.message ?? String(e) },
    });
  }
});
