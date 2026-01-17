import * as auth from "@/api/auth.api";
import * as api from "@/api/me.api";
import { wildcardToRegex } from "@/lib/utils";
import type {
  IMeResponse,
  IUpdateMeBody,
  TokenResponse,
} from "@panah/contract";
import { fromUnixTime, getUnixTime, isBefore } from "date-fns";
import { defineStore } from "pinia";

interface Token {
  token: string;
  expires_at: Date;
}

const STORAGE_KEY = "access_token";

function saveToStorage(value: Token | null) {
  if (value) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: value.token,
        expires_at: getUnixTime(value.expires_at),
      }),
    );
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function loadFromStorage() {
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value) {
    const token = JSON.parse(value) as TokenResponse;
    return {
      token: token.token,
      expires_at: fromUnixTime(token.expires_at),
    };
  }

  return null;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as IMeResponse | null,
    token: loadFromStorage(),
    inited: false,
  }),

  getters: {
    isExpired: (state) => {
      return !state.token || !isBefore(new Date(), state.token.expires_at);
    },
    isAuthed: (state) => {
      return !!state.user;
    },
    userData: (state) => {
      return state.user?.data;
    },
    acronim: (state) => {
      const name = state.user?.data.callname ?? state.user?.data.name;
      if (!name) {
        return "";
      }

      const names = name.trim().split(/\s+/);
      if (names.length > 1) {
        return names
          .slice(0, 2)
          .map((a) => a.charAt(0))
          .join("")
          .toUpperCase();
      }

      return names[0]?.substring(0, 2).toUpperCase() ?? "";
    },
    permissions: (state) => {
      return state.user?.permissions;
    },
  },

  actions: {
    async init() {
      if (this.inited) return;

      if (this.token) {
        try {
          this.user = await api.getMe();
        } catch {
          await this.logout();
        }
      }

      this.inited = true;
    },
    setToken(token: TokenResponse | null) {
      let value = null;
      if (token) {
        value = {
          token: token.token,
          expires_at: fromUnixTime(token.expires_at),
        };
      }

      saveToStorage(value);
      this.token = value;
    },
    async loginWithPassword(email: string, password: string) {
      try {
        const res = await auth.loginWithPassword({
          email,
          password,
        });
        this.setToken(res.access_token);
        this.user = res.user;
      } catch (error) {
        throw error;
      }
    },
    async logout() {
      try {
        await auth.logoutFromServer();
      } catch {
        // ignore server logout error
      } finally {
        saveToStorage(null);
        this.$reset();
        this.inited = true;
      }
    },
    async update(data: IUpdateMeBody) {
      try {
        const res = await api.updateMe(data);
        this.user = res;
      } catch (error) {
        throw error;
      }
    },
    async updateImage(image: File) {
      try {
        const res = await api.updateMeImage(image);
        this.user = res;
      } catch (error) {
        throw error;
      }
    },
    hasPermission(perm: string | string[]) {
      if (!this.permissions) {
        return false;
      }

      if (typeof perm == "string") {
        return (
          this.permissions.findIndex((p: string) =>
            p.match(wildcardToRegex(perm as string)),
          ) > -1
        );
      }

      return (
        perm.findIndex(
          (search) =>
            this.permissions!.findIndex((p: string) =>
              p.match(wildcardToRegex(search as string)),
            ) > -1,
        ) > -1
      );
    },
  },
});
