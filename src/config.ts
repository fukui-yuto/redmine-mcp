export interface Config {
  redmineUrl: string;
  apiKey: string;
}

export function loadConfig(): Config {
  const redmineUrl = process.env.REDMINE_URL;
  if (!redmineUrl) {
    throw new Error("REDMINE_URL environment variable is required");
  }

  const apiKey = process.env.REDMINE_API_KEY;
  if (!apiKey) {
    throw new Error("REDMINE_API_KEY environment variable is required");
  }

  return {
    redmineUrl: redmineUrl.replace(/\/+$/, ""),
    apiKey,
  };
}
