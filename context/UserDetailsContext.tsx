import { UsersDetail } from "@/app/provider";
import { createContext } from "react";

export const UserDetailsContext=createContext<{
    usersDetail: UsersDetail | undefined;
    setUserDetail: (detail: UsersDetail | undefined) => void;
} | undefined>(undefined);