export interface Type {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Mechanism {
  id: number;
  name: string;
}

export type Classification = "types" | "categories" | "mechanisms";

interface Images {
  "96x96": string;
}

interface Duration {
  min: number;
  max: number;
}

export interface PlayersRange {
  min: number;
  max: number | null;
}

export interface Boardgame {
  id: number;
  name: string;
  images: Images;
  yearPublished: number;
  shortDescription: string | null;
  rate: number;
  complexity: number;
  duration: Duration;
  minAge: number;
  players: PlayersRange;
  bestPlayers: PlayersRange[];
}
