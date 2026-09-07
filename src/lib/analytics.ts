declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env["VITE_GA_MEASUREMENT_ID"] as string | undefined;

let initialized = false;

export function initAnalytics(): void {
  if (initialized) return;
  if (!MEASUREMENT_ID) {
    // Google Analytics is optional; skip silently when no ID is configured.
    return;
  }

  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);
}

export function trackPageView(path: string): void {
  if (!initialized || !MEASUREMENT_ID) return;
  window.gtag("event", "page_view", { page_path: path });
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!initialized || !MEASUREMENT_ID) return;
  window.gtag("event", name, params ?? {});
}
