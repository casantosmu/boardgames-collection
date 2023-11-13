import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface AlternateNames {
  alternateName: string;
  boardgameId: number;
}

export interface BestPlayers {
  bestPlayersId: Generated<number>;
  boardgameId: number;
  maxPlayers: number | null;
  minPlayers: number;
}

export interface Boardgames {
  boardgameId: Generated<number>;
  boardgameName: string;
  complexity: number;
  description: string;
  maxDuration: number;
  maxPlayers: number | null;
  minAge: number;
  minDuration: number;
  minPlayers: number;
  rate: Generated<number>;
  shortDescription: string | null;
  yearPublished: number;
}

export interface BoardgamesCategories {
  boardgameId: number;
  category: string;
}

export interface BoardgamesMechanisms {
  boardgameId: number;
  mechanism: string;
}

export interface BoardgamesTypes {
  boardgameId: number;
  type: string;
}

export interface Categories {
  category: string;
}

export interface Mechanisms {
  mechanism: string;
}

export interface Types {
  type: string;
}

export interface DB {
  alternateNames: AlternateNames;
  bestPlayers: BestPlayers;
  boardgames: Boardgames;
  boardgamesCategories: BoardgamesCategories;
  boardgamesMechanisms: BoardgamesMechanisms;
  boardgamesTypes: BoardgamesTypes;
  categories: Categories;
  mechanisms: Mechanisms;
  types: Types;
}
