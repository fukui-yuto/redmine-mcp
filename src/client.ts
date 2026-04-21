import { Config } from "./config.js";

export interface RedmineResponse<T = unknown> {
  data: T;
  status: number;
}

export class RedmineClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: Config) {
    this.baseUrl = config.redmineUrl;
    this.apiKey = config.apiKey;
  }

  async get<T = unknown>(
    path: string,
    params?: Record<string, string | number | undefined>
  ): Promise<RedmineResponse<T>> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, { method: "GET" });
  }

  async post<T = unknown>(
    path: string,
    body: unknown
  ): Promise<RedmineResponse<T>> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async put<T = unknown>(
    path: string,
    body: unknown
  ): Promise<RedmineResponse<T>> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async del<T = unknown>(path: string): Promise<RedmineResponse<T>> {
    const url = this.buildUrl(path);
    return this.request<T>(url, { method: "DELETE" });
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | undefined>
  ): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async request<T>(
    url: string,
    init: RequestInit
  ): Promise<RedmineResponse<T>> {
    const headers: Record<string, string> = {
      "X-Redmine-API-Key": this.apiKey,
      ...(init.headers as Record<string, string>),
    };

    console.error(`[redmine-mcp] ${init.method} ${url}`);

    const res = await fetch(url, { ...init, headers });

    console.error(`[redmine-mcp] ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const text = await res.text();
      let message: string;
      try {
        const json = JSON.parse(text);
        message = JSON.stringify(json.errors ?? json);
      } catch {
        message = text.substring(0, 500);
      }
      throw new Error(`Redmine API error (${res.status}): ${message}`);
    }

    // 204 No Content
    if (res.status === 204 || res.status === 205) {
      return { data: {} as T, status: res.status };
    }

    const data = (await res.json()) as T;
    return { data, status: res.status };
  }
}
