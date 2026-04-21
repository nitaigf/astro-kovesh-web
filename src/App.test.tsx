import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

const successResponse = {
  normalized_input: {
    local_datetime: "2026-04-20T14:30:00-03:00",
    utc_datetime: "2026-04-20T17:30:00+00:00",
    timezone: "America/Sao_Paulo",
    coordinates: {
      lat: -23.5505,
      lng: -46.6333,
      name: "Sao Paulo, SP, Brasil",
    },
    zodiac_mode: "tropical",
    house_system: "placidus",
  },
  planets: [
    {
      name: "Sun",
      longitude: 30,
      latitude: 0,
      speed: 1,
      sign: "Taurus",
      degree_in_sign: 0,
      retrograde: false,
    },
  ],
  points: [],
  asteroids: [],
  ascendant: {
    name: "Ascendant",
    longitude: 120,
    latitude: 0,
    speed: 0,
    sign: "Cancer",
    degree_in_sign: 0,
    retrograde: false,
  },
  houses: Array.from({ length: 12 }).map((_, idx) => ({
    house: idx + 1,
    longitude: idx * 30,
    sign: "Aries",
  })),
  aspects: [],
};

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders title and submit button", () => {
    render(() => <App />);

    expect(screen.getByText("Astro Kovesh")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Consultar mapa" })).toBeInTheDocument();

    const openApiLink = screen.getByRole("link", { name: "OpenAPI" });
    const reDocLink = screen.getByRole("link", { name: "ReDoc" });

    expect(openApiLink).toHaveAttribute("href", "http://localhost:8010/?doc=openapi");
    expect(reDocLink).toHaveAttribute("href", "http://localhost:8010/?doc=redoc");
  });

  it("submits form and renders normalized result", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => successResponse,
    } as Response);

    render(() => <App />);

    fireEvent.click(screen.getByRole("button", { name: "Consultar mapa" }));

    await waitFor(() => {
      expect(screen.getByText("Dados normalizados")).toBeInTheDocument();
    });

    expect(screen.getByText(/Timezone:/)).toHaveTextContent("America/Sao_Paulo");
  });

  it("shows friendly error when API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ detail: { message: "location not found" } }),
    } as Response);

    render(() => <App />);

    fireEvent.click(screen.getByRole("button", { name: "Consultar mapa" }));

    await waitFor(() => {
      expect(screen.getByText("location not found")).toBeInTheDocument();
    });
  });
});
