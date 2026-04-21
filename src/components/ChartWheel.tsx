import { For, createMemo } from "solid-js";
import type { BodyPosition, HousePosition } from "../types/chart";

interface ChartWheelProps {
  houses: HousePosition[];
  planets: BodyPosition[];
  ascendant: BodyPosition;
}

function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

export default function ChartWheel(props: ChartWheelProps) {
  const chartPoints = createMemo(() => {
    const cx = 180;
    const cy = 180;
    const radius = 128;
    return props.planets.map((planet) => {
      const rad = degToRad(planet.longitude);
      return {
        ...planet,
        x: cx + Math.cos(rad) * radius,
        y: cy + Math.sin(rad) * radius,
      };
    });
  });

  return (
    <svg viewBox="0 0 360 360" class="chart-wheel" role="img" aria-label="Astrology chart wheel">
      <defs>
        <radialGradient id="wheelGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#091022" />
          <stop offset="100%" stop-color="#02060f" />
        </radialGradient>
      </defs>

      <circle cx="180" cy="180" r="165" fill="url(#wheelGlow)" stroke="#2de2d0" stroke-width="1.5" />
      <circle cx="180" cy="180" r="140" fill="none" stroke="#173559" stroke-width="1" />

      <For each={props.houses}>
        {(house) => {
          const r = degToRad(house.longitude);
          const x2 = 180 + Math.cos(r) * 165;
          const y2 = 180 + Math.sin(r) * 165;
          const labelX = 180 + Math.cos(r) * 152;
          const labelY = 180 + Math.sin(r) * 152;
          return (
            <>
              <line x1="180" y1="180" x2={x2} y2={y2} stroke="#1d416d" stroke-width="1" />
              <text x={labelX} y={labelY} fill="#9ac3ff" font-size="9" text-anchor="middle" dominant-baseline="middle">
                {house.house}
              </text>
            </>
          );
        }}
      </For>

      <For each={chartPoints()}>
        {(planet) => (
          <g>
            <circle cx={planet.x} cy={planet.y} r="4" fill="#ffd166" />
            <text x={planet.x + 6} y={planet.y - 6} fill="#f9f7f3" font-size="8">
              {planet.name.slice(0, 2)}
            </text>
          </g>
        )}
      </For>

      <g>
        <circle cx="180" cy="180" r="8" fill="#2de2d0" />
        <text x="180" y="195" fill="#9ac3ff" font-size="9" text-anchor="middle">
          ASC {props.ascendant.sign}
        </text>
      </g>
    </svg>
  );
}
