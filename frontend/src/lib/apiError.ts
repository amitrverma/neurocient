type ErrorDetail = {
  code?: unknown;
  message?: unknown;
  correlation_id?: unknown;
};

const CODE_MESSAGES: Record<string, string> = {
  abuse_protection_unavailable:
    "This action is temporarily unavailable. Please try again.",
  csrf_failed:
    "Your session could not be verified. Refresh and try again.",
  internal_error: "Something went wrong. Please try again.",
  payload_too_large: "That submission is too large.",
  rate_limited: "Too many attempts. Please wait and try again.",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const supportReference = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return /^[0-9a-f-]{8,64}$/i.test(normalized)
    ? normalized.slice(0, 8)
    : undefined;
};

export function apiErrorMessage(
  payload: unknown,
  fallback: string,
  response?: Response,
): string {
  const detail = isRecord(payload) && "detail" in payload
    ? payload.detail
    : payload;

  if (typeof detail === "string" && detail.trim()) return detail.trim();

  const structured = isRecord(detail) ? (detail as ErrorDetail) : undefined;
  const explicitMessage =
    typeof structured?.message === "string" && structured.message.trim()
      ? structured.message.trim()
      : undefined;
  const code =
    typeof structured?.code === "string" ? structured.code : undefined;
  const message = explicitMessage || (code ? CODE_MESSAGES[code] : undefined) || fallback;
  const reference = supportReference(
    structured?.correlation_id || response?.headers.get("x-correlation-id"),
  );

  return reference ? `${message} Reference: ${reference}.` : message;
}
