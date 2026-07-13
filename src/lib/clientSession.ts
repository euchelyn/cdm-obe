import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export function getClientUser() {
  const token =
    Cookies.get("user");

  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}