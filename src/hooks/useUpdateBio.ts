// hooks/useUpdateBio.ts
import { trpc } from "@/trpc/client";

export const useUpdateBio = () => {
  const mutation = trpc.users.updateBio.useMutation();
  return mutation;
};