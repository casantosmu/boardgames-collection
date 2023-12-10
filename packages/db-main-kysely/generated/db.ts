import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface AlternateNames {
  alternateName: string;
  alternateNameId: Generated<number>;
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
  categoryId: number;
}

export interface BoardgamesMechanisms {
  boardgameId: number;
  mechanismId: number;
}

export interface BoardgamesTypes {
  boardgameId: number;
  typeId: number;
}

export interface Categories {
  categoryId: Generated<number>;
  categoryName: string;
}

export interface Mechanisms {
  mechanismId: Generated<number>;
  mechanismName: string;
}

export interface Types {
  typeId: Generated<number>;
  typeName: string;
}

export interface Users {
  email: string;
  password: string;
  userId: Generated<number>;
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
  users: Users;
}
