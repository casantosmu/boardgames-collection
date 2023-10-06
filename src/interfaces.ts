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

interface Players {
  min: number;
  max: number;
  community: {
    min: number;
    max: number;
  };
  best: {
    min: number;
    max: number;
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
  players: Players;
  duration: Duration;
  complexity: number;
  types: Type[];
  categories: Category[];
  mechanisms: Mechanism[];
}
