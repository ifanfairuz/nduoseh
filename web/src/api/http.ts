import type { IRefreshTokenResponse } from "@nduoseh/contract";
import { config } from "@/lib/config";
import { useAuthStore } from "@/stores/auth.store";
import axios, { isAxiosError } from "axios";
import qs from "qs";
import { ValidationException } from "./exceptions/ValidationException";
import { WithMessageException } from "./exceptions/WithMessageException";

/**
 * Create http client
 *
 * @returns {AxiosInstance}
 */
export function createHttpClient() {
  const http = axios.create({
    baseURL: config.api_url,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
    paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
  });

  http.interceptors.response.use(
    (res) => res,
    (err) => {
      if (isAxiosError(err)) {
        if (err.response?.status == 401) return Promise.reject(err);

        if (
          err.response?.status == 400 &&
          err.response.data.error === "Validation Error"
        ) {
          return Promise.reject(
            new ValidationException(
              err.response.data.issues,
              err.response.data.message,
            ),
          );
        }

        if (err.response?.data.message) {
          return Promise.reject(
            new WithMessageException(err.response.data.message),
          );
        }
      }

      return Promise.reject(err);
    },
  );

  return http;
}

let is_refreshing = false;
let queue: ((token: string | null) => Promise<unknown>)[] = [];

/**
 * Refresh token
 *
 * @param {ReturnType<typeof useAuthStore>} store
 * @returns {Promise<TokenResponse>}
 */
async function refreshToken(store: ReturnType<typeof useAuthStore>) {
  if (!store.token) {
    return Promise.reject(new Error("Token not found"));
  }

  is_refreshing = true;
  try {
    const res = await createHttpClient().post<IRefreshTokenResponse>(
      "/auth/token/refresh",
    );
    store.setToken(res.data.access_token);
    queue.forEach((fn) => fn(res.data.access_token.token));
    queue = [];

    return res.data.access_token;
  } catch (error) {
    queue.forEach((fn) => fn(null));
    queue = [];

    await store.logout();
    throw error;
  } finally {
    is_refreshing = false;
  }
}

// create default http client
const http = createHttpClient();

/**
 * Interceptors
 *
 * attach token to request header
 * refresh token if token expired
 */
http.interceptors.request.use((request) => {
  const store = useAuthStore();
  if (store.token) {
    request.headers["Authorization"] = `Bearer ${store.token.token}`;
  }

  return request;
});

/**
 * Response interceptors
 *
 * handle 401 error
 * refresh token if token expired
 */
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const store = useAuthStore();

    if (!isAxiosError(error)) throw error;
    if (error.response?.status !== 401) throw error;
    if (!error.config) throw error;

    let original = error.config;
    if (is_refreshing) {
      return new Promise((resolve, reject) =>
        queue.push(async (token) => {
          if (!token) return reject(error);

          try {
            original.headers["Authorization"] = `Bearer ${token}`;
            const res = await http(original);
            resolve(res);
          } catch (error) {
            reject(error);
          }
        }),
      );
    }

    const token = await refreshToken(store);
    original.headers["Authorization"] = `Bearer ${token.token}`;
    return http(original);
  },
);

export default http;
