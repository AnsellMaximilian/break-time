import { Models } from "appwrite";
import { Dispatch, SetStateAction } from "react";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type UserProfile = Models.Document & {
  username: string;
  name?: string;
  bio?: string;
  birthDate?: string;
  friendIds: string[];
};

export type User = Models.User<Models.Preferences> & {
  profile: UserProfile;
};

export type RemoteData<T> = {
  data: T;
  isLoading: boolean;
};

export type RemoteDataWithSetter<T> = RemoteData<T> & {
  setData: Dispatch<SetStateAction<RemoteData<T>>>;
};

export type Pinata = Models.Document & {
  title: string;
  description?: string;
  contributeStart?: string;
  contributeEnd?: string;
  minimumOpenTime?: string;
  allowedContributorIds: string[];
  allowedOpenerIds: string[];

  thumbnailCid?: string;
};

export type Contribution = Models.Document & {
  title: string;
  fileType: string;
  pinataId: string;
};
