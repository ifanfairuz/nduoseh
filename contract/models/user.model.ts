/**
 * User is end user application
 *
 */
export interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  image: string | null;
  callname: string | null;
}
