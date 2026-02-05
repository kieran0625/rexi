export type ApiVersion = "v1beta" | "v1";

export type GeminiErrorBody = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export type ListedModel = {
  id: string;
  supportedGenerationMethods: string[];
};

export type GenerateContentTextResult = {
  text: string;
  raw: any;
};

export type GenerateContentImageResult = {
  mimeType: string;
  dataBase64: string;
  raw: any;
};

export type PredictImagenResult = {
  mimeType: string;
  bytesBase64Encoded: string;
  raw: any;
};

const DEFAULT_API_VERSIONS: ApiVersion[] = ["v1beta", "v1"];

function buildError(message: string, extra: Record<string, unknown>) {
  const e = new Error(message);
  for (const [k, v] of Object.entries(extra)) (e as any)[k] = v;
  return e;
}

function getApiKeyHeader(apiKey: string) {
  return { "x-goog-api-key": apiKey };
}

export async function listModels(apiKey: string, apiVersion: ApiVersion): Promise<ListedModel[]> {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models`;
  const res = await fetch(url, { method: "GET", headers: { ...getApiKeyHeader(apiKey) } });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const message = (body as GeminiErrorBody | undefined)?.error?.message || `${res.status} ${res.statusText}`.trim();
    throw buildError(message, { status: res.status, apiVersion });
  }

  const rawModels: Array<{ name?: string; supportedGenerationMethods?: string[] }> = body?.models || [];
  return rawModels
    .map((m) => {
      const name = (m.name || "").trim();
      const id = name.startsWith("models/") ? name.slice("models/".length) : name;
      return {
        id,
        supportedGenerationMethods: Array.isArray(m.supportedGenerationMethods) ? m.supportedGenerationMethods : [],
      };
    })
    .filter((m) => !!m.id);
}

export async function listModelsAnyVersion(apiKey: string, apiVersions: ApiVersion[] = DEFAULT_API_VERSIONS) {
  let lastError: any;
  for (const apiVersion of apiVersions) {
    try {
      const models = await listModels(apiKey, apiVersion);
      return { apiVersion, models };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("无法获取可用模型列表");
}

export function scoreModelId(id: string) {
  const lower = id.toLowerCase();
  const versionMatch = lower.match(/gemini-(\d+(?:\.\d+)?)/);
  const version = versionMatch ? Number(versionMatch[1]) : 0;
  let score = Math.floor(version * 100);
  if (lower.includes("pro")) score += 40;
  if (lower.includes("flash")) score += 20;
  if (lower.includes("image")) score += 10;
  if (lower.includes("preview")) score += 5;
  return score;
}

export function chooseBestModelId(params: {
  models: ListedModel[];
  preferredModelId?: string;
  requiredMethod: string;
  includeText?: string[];
  excludeText?: string[];
}) {
  const { models, preferredModelId, requiredMethod, includeText, excludeText } = params;
  const supported = models.filter((m) => m.supportedGenerationMethods.includes(requiredMethod));
  const normalizedPreferred = (preferredModelId || "").trim();
  if (normalizedPreferred && supported.some((m) => m.id === normalizedPreferred)) return normalizedPreferred;

  const filtered = supported.filter((m) => {
    const id = m.id.toLowerCase();
    if (includeText?.length && !includeText.some((t) => id.includes(t.toLowerCase()))) return false;
    if (excludeText?.length && excludeText.some((t) => id.includes(t.toLowerCase()))) return false;
    return true;
  });

  const candidates = filtered.length ? filtered : supported;
  candidates.sort((a, b) => scoreModelId(b.id) - scoreModelId(a.id));
  return candidates[0]?.id;
}

export type GroundingMetadata = {
  webSearchQueries?: string[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
  groundingChunks?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
  groundingSupports?: Array<{
    segment?: {
      startIndex?: number;
      endIndex?: number;
      text?: string;
    };
    groundingChunkIndices?: number[];
    confidenceScores?: number[];
  }>;
};

export type GenerateContentTextResultWithGrounding = GenerateContentTextResult & {
  groundingMetadata?: GroundingMetadata;
};

export async function generateContentText(params: {
  apiKey: string;
  apiVersion: ApiVersion;
  modelId: string;
  prompt: string;
  enableGrounding?: boolean;
}): Promise<GenerateContentTextResultWithGrounding> {
  const { apiKey, apiVersion, modelId, prompt, enableGrounding = false } = params;
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelId}:generateContent`;

  const requestBody: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  // Add Google Search grounding if enabled
  if (enableGrounding) {
    requestBody.tools = [{
      google_search: {}
    }];
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getApiKeyHeader(apiKey) },
    body: JSON.stringify(requestBody),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const message = (body as GeminiErrorBody | undefined)?.error?.message || `${res.status} ${res.statusText}`.trim();
    throw buildError(message, { status: res.status, apiVersion, modelId });
  }

  const parts: Array<{ text?: string }> | undefined = body?.candidates?.[0]?.content?.parts;
  const text = (parts || []).map((p) => p.text || "").join("").trim();
  if (!text) throw buildError("Gemini 返回内容为空", { status: 502, apiVersion, modelId });

  const groundingMetadata: GroundingMetadata | undefined = body?.candidates?.[0]?.groundingMetadata;

  return { text, raw: body, groundingMetadata };
}

export async function generateContentImage(params: {
  apiKey: string;
  apiVersion: ApiVersion;
  modelId: string;
  prompt: string;
}): Promise<GenerateContentImageResult> {
  const { apiKey, apiVersion, modelId, prompt } = params;
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelId}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getApiKeyHeader(apiKey) },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const message = (body as GeminiErrorBody | undefined)?.error?.message || `${res.status} ${res.statusText}`.trim();
    throw buildError(message, { status: res.status, apiVersion, modelId });
  }

  const parts: Array<{
    inline_data?: { mime_type?: string; data?: string };
    inlineData?: { mimeType?: string; data?: string };
  }> | undefined = body?.candidates?.[0]?.content?.parts;

  const firstInline = (parts || []).find((p) => p.inlineData?.data || p.inline_data?.data);
  const mimeType = firstInline?.inlineData?.mimeType || firstInline?.inline_data?.mime_type || "image/png";
  const dataBase64 = firstInline?.inlineData?.data || firstInline?.inline_data?.data || "";
  if (!dataBase64) throw buildError("Gemini 未返回图片数据", { status: 502, apiVersion, modelId });
  return { mimeType, dataBase64, raw: body };
}

export async function predictImagen(params: {
  apiKey: string;
  apiVersion: ApiVersion;
  modelId: string;
  prompt: string;
  sampleCount?: number;
}): Promise<PredictImagenResult> {
  const { apiKey, apiVersion, modelId, prompt, sampleCount } = params;
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelId}:predict`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getApiKeyHeader(apiKey) },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: sampleCount ?? 1 },
    }),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const message = (body as GeminiErrorBody | undefined)?.error?.message || `${res.status} ${res.statusText}`.trim();
    throw buildError(message, { status: res.status, apiVersion, modelId });
  }

  const pred = body?.predictions?.[0];
  const mimeType = pred?.mimeType || "image/png";
  const bytesBase64Encoded = pred?.bytesBase64Encoded || "";
  if (!bytesBase64Encoded) throw buildError("Imagen 未返回图片数据", { status: 502, apiVersion, modelId });
  return { mimeType, bytesBase64Encoded, raw: body };
}
