import { Pinata, RemoteData, RemoteDataWithSetter, UserProfile } from "@/types";
import { createContext, Dispatch, SetStateAction, useContext } from "react";
export interface DataContextData {
  pinatas: RemoteDataWithSetter<Pinata[]>;
  friends: RemoteDataWithSetter<UserProfile[]>;
}

export const DataContext = createContext<DataContextData>({
  pinatas: {
    isLoading: false,
    data: [],
    setData: () => {},
  },
  friends: {
    isLoading: false,
    data: [],
    setData: () => {},
  },
});

export const useData = (): DataContextData => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "useData must be used within a corresponding ContextProvider"
    );
  }
  return context;
};
