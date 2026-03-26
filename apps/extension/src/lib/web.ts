const DEFAULT_WEB_DASHBOARD_URL = "https://cygnet-two.vercel.app/dashboard";
const DEFAULT_WEB_LOGIN_URL = "https://cygnet-two.vercel.app/auth/login?next=/dashboard";

export function getWebDashboardUrl(): string {
  const configured = String(import.meta.env.VITE_WEB_DASHBOARD_URL || "").trim();
  return configured || DEFAULT_WEB_DASHBOARD_URL;
}

export function getWebLoginUrl(): string {
  const dashboardUrl = getWebDashboardUrl();
  try {
    const loginUrl = new URL(dashboardUrl);
    loginUrl.pathname = "/auth/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", "/dashboard");
    return loginUrl.toString();
  } catch {
    return DEFAULT_WEB_LOGIN_URL;
  }
}

async function openUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

export async function openWebDashboard(): Promise<void> {
  return openUrl(getWebDashboardUrl());
}

export async function openWebLogin(): Promise<void> {
  return openUrl(getWebLoginUrl());
}
