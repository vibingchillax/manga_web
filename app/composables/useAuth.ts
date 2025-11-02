import { UserRole } from "~~/shared/prisma/enums";

export interface Session {
  id: string;
  email: string;
  username: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

const STAFF_ROLES: UserRole[] = [UserRole.admin];

export const useAuth = () => {
  const session = useState<Session | null>("session", () => null);
  const redirect = useState<string | null>("authRedirect", () => null);
  const loggedIn = computed(() => Boolean(session.value));

  const fetch = async () => {
    session.value = await $fetch("/api/auth/session", { method: "GET" });
  };

  const refresh = async () => {
    try {
      console.log("Attempting to refresh token");
      await $fetch("/api/auth/refresh", { method: "POST" });
      await fetch();
      console.log("Successfully refreshed access token for user");
    } catch (e) {
      console.error("Failed to refresh access token", e);
      await logout();
    }
  };

  const hasRole = (roles: UserRole[]) =>
    computed(() => !!session.value?.roles.some((r) => roles.includes(r)));

  const isStaff = hasRole(STAFF_ROLES);

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    session.value = null;
  };

  return {
    loggedIn,
    session,
    redirect,
    isStaff,
    fetch,
    refresh,
    hasRole,
    logout,
  };
};
