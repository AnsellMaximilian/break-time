import { config, databases } from "@/lib/appwrite";
import { ReactNode, useEffect, useState } from "react";
import { Pinata, RemoteData, UserProfile } from "@/types";
import { DataContext } from "./DataContext";
import {
  getDefaultRemoteData,
  getRemoteDataWithSetter,
  setRemoteDataLoading,
} from "@/utils/common";
import { Query } from "appwrite";
import { useUser } from "../user/UserContext";

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useUser();
  const [pinatas, setPinatas] = useState<RemoteData<Pinata[]>>(
    getDefaultRemoteData([])
  );

  const [friends, setFriends] = useState<RemoteData<UserProfile[]>>(
    getDefaultRemoteData([])
  );

  useEffect(() => {
    (async () => {
      setRemoteDataLoading(setPinatas, true);

      const resPinatas = await databases.listDocuments(
        config.dbId,
        config.pinataCollectionId
      );

      const pinatas = resPinatas.documents as Pinata[];

      setPinatas((prev) => ({
        ...prev,
        data: pinatas,
      }));

      setRemoteDataLoading(setPinatas, false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (currentUser?.profile && currentUser.profile.friendIds.length > 0) {
        setRemoteDataLoading(setFriends, true);

        const resUserProfs = await databases.listDocuments(
          config.dbId,
          config.userProfileCollectionId,
          [Query.equal("$id", currentUser.profile.friendIds)]
        );

        const friends = resUserProfs.documents as UserProfile[];

        setFriends((prev) => ({ ...prev, data: friends }));

        setRemoteDataLoading(setFriends, false);
      }
    })();
  }, [currentUser]);

  return (
    <DataContext.Provider
      value={{
        pinatas: getRemoteDataWithSetter<Pinata[]>(pinatas, setPinatas),
        friends: getRemoteDataWithSetter<UserProfile[]>(friends, setFriends),
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
