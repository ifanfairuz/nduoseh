import { User } from "../models";

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

export interface IUpdateUserBody {
  name: string;
  callname: string;
}

export interface IUpdateUserImageBody {
  image: string | File | Blob | Buffer;
}
