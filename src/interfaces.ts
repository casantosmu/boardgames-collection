interface Description {
  long: string;
  short: string;
}

interface Image {
  name: string;
}

interface Rating {
  avg: number;
  count: number;
}

interface PlayerProps {
  players: number[];
  more: boolean;
}

interface Player {
  official: PlayerProps;
  community: PlayerProps;
  best: PlayerProps;
}

interface Duration {
  min: number;
  max: number;
}

interface Type {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Mechanism {
  id: number;
  name: string;
}

export interface Gameboard {
  id: number;
  name: string;
  names: string[];
  url: string;
  rank: number;
  year: number;
  description: Description;
  img: Image;
  rating: Rating;
  players: Player;
  duration: Duration;
  complexity: number;
  types: Type[];
  categories: Category[];
  mechanisms: Mechanism[];
}

export interface Collection {
  gameboard: Omit<Gameboard, "img">;
  imageSrc: string;
}
