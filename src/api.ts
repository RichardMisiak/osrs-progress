import { StatsResponse } from "./types";

export const baseUrl =
  import.meta.env.VITE_API_URL ??
  "https://osrs-stats.richard-h-misiak.workers.dev";

export const api = {
  getStats: async (
    user: string
  ): Promise<{ data: StatsResponse } | { errorResponse: Response }> => {
    const response = await fetch(`${baseUrl}?user=${user.trim()}`);
    if (response.status === 200) {
      const json: StatsResponse = await response.json();
      return { data: json };
    } else {
      return { errorResponse: response };
    }
  },
};
