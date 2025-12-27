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

  // Get user session to identify who started the workflow
  const session = await getUserSession(event).catch(() => null);
  const userEmail = session?.user?.email || 'anonymous';

  try {
    const res = await $fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        "X-API-Key": xApiKey || ''
      },
      body: {
        source: 'mypoems',
        ts: new Date().toISOString(),
        startedBy: userEmail,
        ...body,
      },
    });

    // Store execution in DB
    try {
      const executionId = res?.data?.executionId || res?.executionId
      const resumeUrl = res?.data?.resumeUrl || res?.resumeUrl
      
      let userId = null
      if (session?.user?.email) {
        const [user] = await sql`SELECT id FROM users WHERE email = ${session.user.email}`
        userId = user?.id || null
      }

      if (executionId) {
        await sql`
          INSERT INTO executions (
            user_id, 
            n8n_execution_id, 
            status, 
            started_at, 
            payload,
            resume_url
          ) VALUES (
            ${userId}, 
            ${executionId}, 
            'running', 
            ${new Date()}, 
            ${body},
            ${resumeUrl}
          )
        `
      }
    } catch (dbError) {
      console.error('Failed to save execution to DB:', dbError)
      // Do not fail the request if DB logging fails
    }

    return {ok: true, data: res};
  } catch (e: any) {
    console.error('Error calling n8n webhook:', e);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed calling n8n webhook.',
      data: {message: e?.message ?? String(e)},
    });
  }
});
