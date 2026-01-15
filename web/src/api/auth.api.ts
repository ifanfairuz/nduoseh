import type { IAuthResponse, ILoginWithPasswordBody } from "@panah/contract";
import http, { createHttpClient } from "./http";

export async function loginWithPassword(body: ILoginWithPasswordBody) {
  // force using new http client instance
  // to avoid token refreshing
  const http = createHttpClient();
  const res = await http.post<IAuthResponse>("/auth/password/login", body);
  return res.data;
}

export async function logoutFromServer() {
  await http.delete("/auth/logout");
}
