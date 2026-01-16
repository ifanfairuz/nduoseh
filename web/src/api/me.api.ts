import type { IMeResponse, IUpdateMeBody } from "@panah/contract";
import http from "./http";

export async function getMe() {
  const res = await http.get<IMeResponse>("/me");
  return res.data;
}

export async function updateMe(data: IUpdateMeBody) {
  const res = await http.put<IMeResponse>("/me", data);
  return res.data;
}

export async function updateMeImage(image: File) {
  const formData = new FormData();
  formData.append("image", image);
  const res = await http.post<IMeResponse>("/me/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
