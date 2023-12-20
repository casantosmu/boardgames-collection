import type { DtosV1 } from "common";
import { useQuery, type FetchState } from "../../hooks/api";

export const useBoardgamesQuery = (
  params: DtosV1["GetBoardgames"]["Querystring"],
): FetchState<DtosV1["GetBoardgames"]["Response"][200]> => {
  return useQuery("/v1/boardgames", { params });
};
