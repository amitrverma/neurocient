export {};

declare global {
  interface Window {
    posthog?: {
      capture: (
        event: string,
        properties?: Record<string, unknown>
      ) => void;
      [key: string]: unknown;
    };
  }
}
