import { createHmac } from "node:crypto";
import { isIP } from "node:net";

function clientIp(request: Request): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    "";
  const candidate = forwarded.split(",", 1)[0].trim();
  return isIP(candidate) ? candidate : "0.0.0.0";
}

export function abuseProxyHeaders(
  request: Request,
  backendPath: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Record<string, string> {
  const secret = process.env.ABUSE_PROXY_SECRET;
  if (!secret) {
    if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") {
      throw new Error("Protected proxy is unavailable");
    }
    return {};
  }
  if (secret.length < 32) {
    throw new Error("Protected proxy is misconfigured");
  }
  const ip = clientIp(request);
  const signature = createHmac("sha256", secret)
    .update(`${nowSeconds}\n${request.method.toUpperCase()}\n${backendPath}\n${ip}`)
    .digest("hex");
  return {
    "X-Neurocient-Client-IP": ip,
    "X-Neurocient-Proxy-Timestamp": String(nowSeconds),
    "X-Neurocient-Proxy-Signature": signature,
  };
}

export function backendResponseInit(response: Response): ResponseInit {
  const headers = new Headers();
  for (const name of ["retry-after", "cache-control"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return { status: response.status, headers };
}
