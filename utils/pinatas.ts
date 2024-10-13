import { Pinata, User } from "@/types";

export const isUserAllowedToContribute = (
  pinata: Pinata,
  user: User | null
) => {
  return (
    (user && pinata.allowedContributorIds.includes(user.$id)) || pinata.isPulic
  );
};
