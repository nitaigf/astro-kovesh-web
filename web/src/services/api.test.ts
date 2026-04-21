import { describe, expect, it, vi } from "vitest";

import { fetchChart } from "./api";

describe("fetchChart", () => {
  it("returns parsed JSON when response is ok", async () => {
    const payload = {
      date: "2026-04-20",
      time: "14:30:00",
      zodiac_mode: "tropical" as const,
      house_system: "placidus" as const,
      location: { query: "Sao Paulo" },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const result = await fetchChart(payload);
    expect(result).toEqual({ ok: true });
  });

  it("throws friendly message when response is not ok", async () => {
    const payload = {
      date: "2026-04-20",
      time: "14:30:00",
      zodiac_mode: "tropical" as const,
      house_system: "placidus" as const,
      location: { query: "Sao Paulo" },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ detail: { message: "bad request" } }),
    } as Response);

    await expect(fetchChart(payload)).rejects.toThrow("bad request");
  });
});
