import http from "@/api/http";
import type { QueryTableContext } from "@/components/datatable";
import type {
  User,
  Role,
  OffsetPaginatedResult,
  IUpdateUserBodyWithImage,
  ICreateUserBodyWithImage,
  IAssignRoleBody,
  IGetUserRolesResponse,
  IGetUserPermissionsResponse,
} from "@nduoseh/contract";

export async function getUsers(
  ctx?: QueryTableContext,
): Promise<OffsetPaginatedResult<User>> {
  const res = await http.get<OffsetPaginatedResult<User>>("/users", {
    params: {
      limit: ctx?.pagination?.limit,
      page: ctx?.pagination?.page,
      sort: ctx?.sort,
      keyword: ctx?.keyword,
    },
  });
  return res.data;
}

export async function getUser(id: User["id"]) {
  const res = await http.get<User>(`/users/${id}`);
  return res.data;
}

export async function deleteUser(id: User["id"]) {
  await http.delete(`/users/${id}`);
}

export async function restoreUser(id: User["id"]) {
  await http.post(`/users/${id}/restore`);
}

export async function createUser(data: ICreateUserBodyWithImage) {
  const res = await http.postForm<User>(`/users`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function updateUser(
  id: User["id"],
  data: IUpdateUserBodyWithImage,
) {
  const res = await http.putForm<User>(`/users/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// User-Role Assignment API
export async function getUserRoles(userId: User["id"]): Promise<Role[]> {
  const res = await http.get<IGetUserRolesResponse>(`/users/${userId}/roles`);
  return res.data ?? [];
}

export async function getUserPermissions(
  userId: User["id"],
): Promise<string[]> {
  const res = await http.get<IGetUserPermissionsResponse>(
    `/users/${userId}/roles/permissions`,
  );
  return res.data.permissions;
}

export async function assignRole(
  userId: User["id"],
  roleId: Role["id"],
): Promise<void> {
  await http.post<void>(`/users/${userId}/roles`, {
    roleId,
  } as IAssignRoleBody);
}

export async function removeRole(
  userId: User["id"],
  roleId: Role["id"],
): Promise<void> {
  await http.delete<void>(`/users/${userId}/roles/${roleId}`);
}
