type N8nExecutionResponse = {
  id?: string;
  status?: string;
  data?: {
    resultData?: {
      runData?: Record<string, Array<any>>;
    };
  };
  resumeUrl?: string;
};

type PoemsResult = {
  poems: Array<{ title?: string; poem?: string; url?: string }>;
  chapters?: Array<any>;
  sourceNode?: string;
};

const findPoems = (runData?: Record<string, Array<any>>): (PoemsResult & { bookHtml?: string }) | null => {
  if (!runData) return null;

  let result: (PoemsResult & { bookHtml?: string }) | null = null;

  for (const [nodeName, runs] of Object.entries(runData)) {
    for (const run of runs || []) {
      const main = run?.data?.main;
      if (!Array.isArray(main)) continue;

      for (const output of main) {
        if (!Array.isArray(output)) continue;

        for (const item of output) {
          const json = item?.json;
          if (!json) continue;

          // Check for bookHtml first (higher level output)
          if (json.bookHtml || json.html) {
            result = result || { poems: [], sourceNode: nodeName };
            result.bookHtml = json.bookHtml || json.html;
          }

          if (Array.isArray(json.chapters)) {
            result = result || { poems: [], sourceNode: nodeName };
            result.chapters = json.chapters;
          }

          if (Array.isArray(json.poems)) {
            result = result || { poems: [], sourceNode: nodeName };
            result.poems = json.poems;
            result.sourceNode = nodeName;
          }

          if (!result?.poems?.length && (json.title || json.poem)) {
            result = result || { poems: [], sourceNode: nodeName };
            result.poems = output
                .map((it) => it?.json)
                .filter(Boolean)
                .map((it) => ({
                  title: it.title,
                  poem: it.poem,
                  url: it.url,
                }));
            result.sourceNode = nodeName;
          }
        }
      }
    }
  }

  return result;
};

const findResumeUrl = (execution: N8nExecutionResponse): string | null => {
  if (execution.resumeUrl) return execution.resumeUrl;
  const runData = execution?.data?.resultData?.runData;
  if (!runData) return null;

  for (const runs of Object.values(runData)) {
    for (const run of runs || []) {
      if (run?.executionData?.resumeUrl) {
        return run.executionData.resumeUrl;
      }
    }
  }

  return null;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.n8nApiBaseUrl;
  const apiKey = config.n8nApiKey;

  if (!baseUrl || !apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing N8N_API_BASE_URL or N8N_API_KEY in runtimeConfig.',
    });
  }

  const query = getQuery(event);
  const executionId = String(query.executionId || '').trim();

  if (!executionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing executionId query param.',
    });
  }

  console.log("executionId:", executionId);
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/executions/${executionId}?includeData=true`;

  try {
    const res = await $fetch<N8nExecutionResponse>(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
    });

    const poemsResult = findPoems(res?.data?.resultData?.runData);
    const resumeUrl = findResumeUrl(res);

    return {
      ok: true,
      status: res?.status || null,
      resumeUrl,
      poems: poemsResult?.poems || null,
      chapters: poemsResult?.chapters || null,
      poemsSourceNode: poemsResult?.sourceNode || null,
      bookHtml: poemsResult?.bookHtml || null,
    };
  } catch (e: any) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch n8n execution.',
      data: {message: e?.message ?? String(e)},
    });
  }
});
