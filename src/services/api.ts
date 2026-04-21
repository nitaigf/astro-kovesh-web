import type { ChartRequestPayload, ChartResponse } from "../types/chart";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8010";

export async function fetchChart(payload: ChartRequestPayload): Promise<ChartResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/chart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.detail?.message ||
      errorData?.detail ||
      "Failed to fetch chart data. Check your input and try again.";
    throw new Error(String(message));
  }

  return (await response.json()) as ChartResponse;
}
