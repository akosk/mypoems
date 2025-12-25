export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const webhookUrl = config.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL;
  const xApiKey = config.xApiKey || process.env.X_API_KEY;

  if (!webhookUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing N8N_WEBHOOK_URL (server runtimeConfig.n8nWebhookUrl).',
    });
  }

  // You can accept a payload from the client later (e.g. poet.hu username)
  const body = await readBody(event).catch(() => ({}));

  try {
    const res = await $fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        "X-API-Key": xApiKey
      },
      body: {
        source: 'mypoems',
        ts: new Date().toISOString(),
        ...body,
      },
    });

    return {ok: true, data: res};
  } catch (e: any) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed calling n8n webhook.',
      data: {message: e?.message ?? String(e)},
    });
  }
});
