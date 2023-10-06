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

interface Player {
  official: {
    players: number[];
    more: boolean;
  };
  community: {
    players: number[];
    more: boolean;
  };
  best: {
    players: number[];
    more: boolean;
  };
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
