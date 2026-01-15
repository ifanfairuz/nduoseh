import type { IMeResponse } from "@panah/contract";
import http from "./http";

export async function getMe() {
  const res = await http.get<IMeResponse>("/user");
  return res.data;
}
