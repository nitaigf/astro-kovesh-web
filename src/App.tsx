import { For, Show, createMemo, createSignal } from "solid-js";
import ChartWheel from "./components/ChartWheel";
import CosmosBackground from "./components/CosmosBackground";
import { fetchChart } from "./services/api";
import type { ChartRequestPayload, ChartResponse, HouseSystem, ZodiacMode } from "./types/chart";

const HOUSE_SYSTEM_OPTIONS: HouseSystem[] = ["placidus", "koch", "whole_sign"];
const ZODIAC_MODE_OPTIONS: ZodiacMode[] = ["tropical", "sidereal"];
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8010").replace(/\/+$/, "");
const OPENAPI_URL = `${API_BASE_URL}/?doc=openapi`;
const REDOC_URL = `${API_BASE_URL}/?doc=redoc`;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [date, setDate] = createSignal(todayIsoDate());
  const [time, setTime] = createSignal("14:30:00");
  const [query, setQuery] = createSignal("Sao Paulo, SP, Brasil");
  const [lat, setLat] = createSignal("");
  const [lng, setLng] = createSignal("");
  const [timezone, setTimezone] = createSignal("");
  const [zodiacMode, setZodiacMode] = createSignal<ZodiacMode>("tropical");
  const [houseSystem, setHouseSystem] = createSignal<HouseSystem>("placidus");
  const [displayHouseSystem, setDisplayHouseSystem] = createSignal<HouseSystem>("placidus");

  const [result, setResult] = createSignal<ChartResponse | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const normalizedDateTime = createMemo(() => result()?.normalized_input);

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: ChartRequestPayload = {
        date: date(),
        time: time(),
        zodiac_mode: zodiacMode(),
        house_system: displayHouseSystem(),
        location: {},
      };

      if (timezone().trim()) {
        payload.timezone = timezone().trim();
      }

      const latValue = lat().trim();
      const lngValue = lng().trim();

      if (latValue && lngValue) {
        payload.location.lat = Number(latValue);
        payload.location.lng = Number(lngValue);
        payload.location.name = query().trim() || "Custom coordinates";
        if (timezone().trim()) {
          payload.location.timezone = timezone().trim();
        }
      } else {
        payload.location.query = query().trim();
      }

      const chart = await fetchChart(payload);
      setResult(chart);
      setHouseSystem(chart.normalized_input.house_system);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error while fetching chart.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main class="page">
      <CosmosBackground />
      <div class="cosmos-overlay" />

      <section class="glass-card content-layer">
        <h1>Astro Kovesh</h1>
        <p class="subtitle">API publica para calculo astrologico com FastAPI + SolidJS</p>
        <div class="docs-links" aria-label="Links da documentacao da API">
          <a class="doc-link-btn" href={OPENAPI_URL} target="_blank" rel="noreferrer">
            OpenAPI
          </a>
          <a class="doc-link-btn" href={REDOC_URL} target="_blank" rel="noreferrer">
            ReDoc
          </a>
        </div>

        <form class="form" onSubmit={submit}>
          <div class="grid two-cols">
            <label>
              Data
              <input type="date" value={date()} onInput={(e) => setDate(e.currentTarget.value)} required />
            </label>

            <label>
              Hora
              <input
                type="text"
                value={time()}
                onInput={(e) => setTime(e.currentTarget.value)}
                placeholder="14:30 ou 14:30:00"
                required
              />
            </label>
          </div>

          <label>
            Local (texto)
            <input
              type="text"
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              placeholder="Sao Paulo, SP, Brasil"
            />
          </label>

          <div class="grid three-cols">
            <label>
              Latitude (opcional)
              <input type="number" step="any" value={lat()} onInput={(e) => setLat(e.currentTarget.value)} />
            </label>

            <label>
              Longitude (opcional)
              <input type="number" step="any" value={lng()} onInput={(e) => setLng(e.currentTarget.value)} />
            </label>

            <label>
              Timezone (opcional)
              <input
                type="text"
                value={timezone()}
                onInput={(e) => setTimezone(e.currentTarget.value)}
                placeholder="America/Sao_Paulo"
              />
            </label>
          </div>

          <div class="grid three-cols">
            <label>
              Modo zodiacal
              <select value={zodiacMode()} onChange={(e) => setZodiacMode(e.currentTarget.value as ZodiacMode)}>
                <For each={ZODIAC_MODE_OPTIONS}>{(option) => <option value={option}>{option}</option>}</For>
              </select>
            </label>

            <label>
              Sistema de casas (consulta)
              <select
                value={displayHouseSystem()}
                onChange={(e) => setDisplayHouseSystem(e.currentTarget.value as HouseSystem)}
              >
                <For each={HOUSE_SYSTEM_OPTIONS}>{(option) => <option value={option}>{option}</option>}</For>
              </select>
            </label>

            <label>
              Sistema de casas (ultimo resultado)
              <input type="text" value={houseSystem()} disabled />
            </label>
          </div>

          <button type="submit" disabled={loading()}>
            {loading() ? "Consultando..." : "Consultar mapa"}
          </button>
        </form>

        <Show when={error()}>
          <div class="error-box">{error()}</div>
        </Show>

        <Show when={result()}>
          {(chart) => (
            <section class="results">
              <div class="result-block">
                <h2>Dados normalizados</h2>
                <p>Local: {chart().normalized_input.coordinates.name}</p>
                <p>
                  Coordenadas: {chart().normalized_input.coordinates.lat}, {chart().normalized_input.coordinates.lng}
                </p>
                <p>Timezone: {normalizedDateTime()?.timezone}</p>
                <p>Local datetime: {normalizedDateTime()?.local_datetime}</p>
                <p>UTC datetime: {normalizedDateTime()?.utc_datetime}</p>
              </div>

              <div class="result-block">
                <h2>Mapa (SVG)</h2>
                <ChartWheel houses={chart().houses} planets={chart().planets} ascendant={chart().ascendant} />
              </div>

              <div class="result-block">
                <h2>Posicoes planetarias</h2>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Corpo</th>
                        <th>Longitude</th>
                        <th>Signo</th>
                        <th>Retrogrado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={chart().planets}>
                        {(planet) => (
                          <tr>
                            <td>{planet.name}</td>
                            <td>{planet.longitude.toFixed(4)}°</td>
                            <td>
                              {planet.sign} {planet.degree_in_sign.toFixed(2)}°
                            </td>
                            <td>{planet.retrograde ? "Sim" : "Nao"}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="result-block">
                <h2>Ascendente e casas</h2>
                <p>
                  Ascendente: {chart().ascendant.sign} {chart().ascendant.degree_in_sign.toFixed(2)}°
                </p>
                <div class="house-list">
                  <For each={chart().houses}>
                    {(house) => (
                      <div class="house-chip">
                        Casa {house.house}: {house.sign} {house.longitude.toFixed(2)}°
                      </div>
                    )}
                  </For>
                </div>
              </div>

              <div class="result-block">
                <h2>Aspectos principais</h2>
                <Show when={chart().aspects.length > 0} fallback={<p>Nenhum aspecto maior no orbe padrao.</p>}>
                  <ul class="aspects-list">
                    <For each={chart().aspects}>
                      {(aspect) => (
                        <li>
                          {aspect.body_a} - {aspect.body_b}: {aspect.aspect} (orbe {aspect.orb.toFixed(2)}°)
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </div>
            </section>
          )}
        </Show>
      </section>
    </main>
  );
}
