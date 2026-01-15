import type { Branch } from "@panah/contract";
// import http from "./http";

export async function getBranches(): Promise<Branch[]> {
  // const res = await http.get<Branch[]>("/branches");
  // return res.data;

  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "pusat",
          name: "Pusat",
          address: "Jalan Utara, Jakarta",
          logo: "/avatars/shadcn.jpg",
        },
        {
          id: "sidoarjo",
          name: "Sidoarjo",
          address: "Jl. Raya, Sidoarjo",
          logo: "/avatars/shadcn.jpg",
        },
        {
          id: "jakarta",
          name: "Jakarta",
          address: "Jl. Sultan Agung, Jakarta",
          logo: "/avatars/shadcn.jpg",
        },
      ]);
    }, 1000);
  });
}
