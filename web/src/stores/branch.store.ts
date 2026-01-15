import { defineStore } from "pinia";
import type { Branch } from "@panah/contract";
import { getBranches } from "@/api/branch.api";

const STORAGE_KEY = "branch";

export const useBranchStore = defineStore("branch", {
  state: () => ({
    branches: [] as Branch[],
    selected: window.localStorage.getItem(STORAGE_KEY) as string | null,
  }),

  getters: {
    branch: (state) =>
      state.branches.find((branch) => branch.id === state.selected),
  },

  actions: {
    setBranch(branch: Branch | string) {
      if (typeof branch === "string") {
        this.selected = branch;
      } else {
        this.selected = branch.id;
      }
      window.localStorage.setItem(STORAGE_KEY, this.selected);
    },
    async fetchBranches() {
      this.branches = await getBranches();
      if (!this.branch && this.branches.length > 0) {
        this.setBranch(this.branches[0]!);
      }
    },
  },
});
