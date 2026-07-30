import { auth } from "~/server/auth";


export const getSession = async () => {
  return await auth();
};