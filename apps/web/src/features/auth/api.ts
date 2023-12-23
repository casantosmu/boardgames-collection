import type { DtosV1 } from "common";
import {
  useMutation,
  type UseMutation,
  type UseMutationOptions,
} from "../../hooks/api";

export const useRegisterMutation = (
  options?: UseMutationOptions<DtosV1["Register"]["Response"][200]>,
): UseMutation<
  DtosV1["Register"]["Body"],
  DtosV1["Register"]["Response"][200]
> => {
  return useMutation("/v1/auth/register", { method: "POST" }, options);
};

export const useLoginMutation = (
  options?: UseMutationOptions<DtosV1["Login"]["Response"][200]>,
): UseMutation<DtosV1["Login"]["Body"], DtosV1["Login"]["Response"][200]> => {
  return useMutation("/v1/auth/login", { method: "POST" }, options);
};

export const useLogoutMutation = (
  options?: UseMutationOptions<undefined>,
): UseMutation<void, undefined> => {
  return useMutation("/v1/auth/logout", { method: "GET" }, options);
};
