/**
 * Role represents a permission set that can be assigned to users
 */
export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

/**
 * UserRole is the junction model for many-to-many relationship between users and roles
 */
export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: Date;
}
