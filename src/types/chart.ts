export type ZodiacMode = "tropical" | "sidereal";
export type HouseSystem = "placidus" | "koch" | "whole_sign";

export interface ChartRequestPayload {
  date: string;
  time: string;
  timezone?: string;
  zodiac_mode: ZodiacMode;
  house_system: HouseSystem;
  location: {
    query?: string;
    lat?: number;
    lng?: number;
    name?: string;
    timezone?: string;
  };
}

export interface BodyPosition {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  sign: string;
  degree_in_sign: number;
  retrograde: boolean;
}

export interface HousePosition {
  house: number;
  longitude: number;
  sign: string;
}

export interface Aspect {
  body_a: string;
  body_b: string;
  aspect: string;
  angle: number;
  orb: number;
}

export interface ChartResponse {
  normalized_input: {
    local_datetime: string;
    utc_datetime: string;
    timezone: string;
    coordinates: {
      lat: number;
      lng: number;
      name?: string;
    };
    zodiac_mode: ZodiacMode;
    house_system: HouseSystem;
  };
  planets: BodyPosition[];
  points: BodyPosition[];
  asteroids: BodyPosition[];
  ascendant: BodyPosition;
  houses: HousePosition[];
  aspects: Aspect[];
}
