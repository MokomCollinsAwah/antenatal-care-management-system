import {
  getUser,
  listUsers,
} from "@/server/services/userService";

export const getUsers = listUsers;
export const getUserDetails = getUser;
