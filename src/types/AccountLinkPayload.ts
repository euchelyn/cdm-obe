import { UserRole } from "@/lib/session";

export type AccountLinkPayload = {
  user_account_id: string;
  role: UserRole;
  role_account_id: string;
};