import { config, databases } from "@/lib/appwrite";
import { ReactNode, useEffect, useState } from "react";
import { Pinata, RemoteData } from "@/types";
import { DataContext } from "./DataContext";
import {
  getDefaultRemoteData,
  getRemoteDataWithSetter,
  setRemoteDataLoading,
} from "@/utils/common";
import { Query } from "appwrite";

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [pinatas, setPinatas] = useState<RemoteData<Pinata[]>>(
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

  return (
    <DataContext.Provider
      value={{
        pinatas: getRemoteDataWithSetter<Pinata[]>(pinatas, setPinatas),
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
