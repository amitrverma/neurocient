import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";

function clientIp(request: Request): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    "";
  const candidate = forwarded.split(",", 1)[0].trim();
  return isIP(candidate) ? candidate : "0.0.0.0";
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function correlationHeaders(request: Request): Record<string, string> {
  const inbound = request.headers.get("x-correlation-id")?.trim();
  return {
    "X-Correlation-ID":
      inbound && UUID_PATTERN.test(inbound) ? inbound.toLowerCase() : randomUUID(),
  };
}

export function abuseProxyHeaders(
  request: Request,
  backendPath: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  outboundMethod = request.method,
): Record<string, string> {
  const correlation = correlationHeaders(request);
  const secret = process.env.ABUSE_PROXY_SECRET;
  if (!secret) {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL_ENV === "production" ||
      process.env.VERCEL_ENV === "preview"
    ) {
      throw new Error("Protected proxy is unavailable");
    }
    return { Origin: new URL(request.url).origin, ...correlation };
  }
  if (secret.length < 32) {
    throw new Error("Protected proxy is misconfigured");
  }
  const ip = clientIp(request);
  const signature = createHmac("sha256", secret)
    .update(`${nowSeconds}\n${outboundMethod.toUpperCase()}\n${backendPath}\n${ip}`)
    .digest("hex");
  return {
    Origin: new URL(request.url).origin,
    ...correlation,
    "X-Neurocient-Client-IP": ip,
    "X-Neurocient-Proxy-Timestamp": String(nowSeconds),
    "X-Neurocient-Proxy-Signature": signature,
  };
}

export function mutationProxyHeaders(
  request: Request,
  backendPath: string,
  outboundMethod = request.method,
): Record<string, string> {
  return abuseProxyHeaders(
    request,
    backendPath,
    Math.floor(Date.now() / 1000),
    outboundMethod,
  );
}

export function backendResponseInit(response: Response): ResponseInit {
  const headers = new Headers();
  for (const name of ["retry-after", "cache-control", "x-correlation-id"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return { status: response.status, headers };
}
