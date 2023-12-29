interface PlayersRange {
  min: number;
  max: number | null;
}

export const buildPlayersRangeString = ({ min, max }: PlayersRange): string => {
  if (min === max) {
    return `${min}`;
  }
  if (max === null) {
    return `${min}+`;
  }
  const range = [];
  for (let index = min; index <= max; index++) {
    range.push(index);
  }
  return range.join(", ");
};
