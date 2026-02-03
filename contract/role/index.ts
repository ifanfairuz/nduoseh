export interface ICreateRoleBody {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
}

export interface IUpdateRoleBody {
  name?: string;
  description?: string;
  permissions?: string[];
  active?: boolean;
}
