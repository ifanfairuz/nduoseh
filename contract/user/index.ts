import type { User } from "../models";

export interface IMeResponse {
  data: {
    id: User["id"];
    email: User["email"];
    name: User["name"];
    callname: User["callname"];
    image: User["image"];
  };
  permissions: string[];
  modules: string[];
}

export interface IUpdateMeBody {
  email: string;
  name: string;
  callname: string;
}

export interface IUpdateMeImageBody {
  image: string | File | Blob;
}

export interface ICreateUserBody {
  name: string;
  email: string;
  password: string;
  callname?: string | null;
}

export type ICreateUserBodyWithImage = ICreateUserBody & {
  image?: File | null;
};

export type IUpdateUserBody = Partial<Omit<ICreateUserBody, "password">>;

export type IUpdateUserBodyWithImage = IUpdateUserBody & {
  image?: File | null;
};
