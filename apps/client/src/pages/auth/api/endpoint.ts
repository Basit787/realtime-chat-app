export const authEndpoints = {
  login: () => "/auth/sign-in/email",
  register: () => "/auth/sign-up/email",
  logout: () => "/auth/sign-out",
  session: () => "/auth/get-session",
  updateUser: () => "/auth/update-user",
  changeEmail: () => "/auth/change-email",
  changePassword: () => "/auth/change-password",
  deleteUser: () => "/auth/delete-user",
} as const;
