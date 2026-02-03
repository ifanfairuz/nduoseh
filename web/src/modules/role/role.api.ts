import http from "@/api/http";
import type {
  Role,
  ICreateRoleBody,
  IUpdateRoleBody,
  OffsetPaginatedResult,
  AvailablePermissionsResponse,
} from "@panah/contract";

export async function getRoles(): Promise<OffsetPaginatedResult<Role>> {
  const res = await http.get<OffsetPaginatedResult<Role>>("/roles", {
    params: {
      limit: 0,
    },
  });
  return res.data;
}

export async function getRole(id: Role["id"]) {
  const res = await http.get<Role>(`/roles/${id}`);
  return res.data;
}

export async function deleteRole(id: Role["id"]) {
  await http.delete(`/roles/${id}`);
}

export async function restoreRole(id: Role["id"]) {
  await http.post(`/roles/${id}/restore`);
}

export async function createRole(data: ICreateRoleBody) {
  const res = await http.post<Role>(`/roles`, data);
  return res.data;
}

export async function updateRole(id: Role["id"], data: IUpdateRoleBody) {
  const res = await http.put<Role>(`/roles/${id}`, data);
  return res.data;
}

export async function getAvailablePermissions() {
  const res = await http.get<AvailablePermissionsResponse>("/permissions");
  return res.data;
}
