import { Pinata, User } from "@/types";
import { hasDatePassed } from "./common";
import { format } from "date-fns";

export const isUserAllowedToContribute = (
  pinata: Pinata,
  user: User | null
) => {
  return (
    (user && pinata.allowedContributorIds.includes(user.$id)) ||
    pinata.isContributionPulic
  );
};

export const isUserAllowedToOpen = (pinata: Pinata, user: User | null) => {
  return (
    user &&
    pinata.allowedOpenerIds.includes(user.$id) &&
    !pinata.openerIds.includes(user.$id)
  );
};

export const canPinataBeOpened = (pinata: Pinata) => {
  return (
    !!!pinata.minimumOpenTime ||
    (!!pinata.minimumOpenTime && hasDatePassed(pinata.minimumOpenTime))
  );
};

export const doesPinataAcceptContributions = (pinata: Pinata) => {
  if (pinata.contributeStart && !hasDatePassed(pinata.contributeStart))
    return false;

  if (pinata.contributeEnd && hasDatePassed(pinata.contributeEnd)) return false;

  return true;
};

export const getContributionTimeNode = (pinata: Pinata) => {
  return (
    <span>
      Accepting contributions
      {pinata.contributeStart && (
        <>
          {" "}
          from{" "}
          <span className="text-sm font-bold">
            {format(
              new Date(pinata.contributeStart),
              "MMMM do, yyyy 'at' h:mm a"
            )}
          </span>
        </>
      )}
      {pinata.contributeEnd && (
        <>
          {" "}
          until{" "}
          <span className="text-sm font-bold">
            {format(
              new Date(pinata.contributeEnd),
              "MMMM do, yyyy 'at' h:mm a"
            )}
          </span>
        </>
      )}
    </span>
  );
};

export const getTotalOpeners = (pinata: Pinata) => {
  const openers = pinata.openerIds.filter((op) =>
    pinata.allowedOpenerIds.includes(op)
  );

  return openers.length;
};
