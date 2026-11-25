"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailsContext } from "@/context/UserDetailsContext";

export type UsersDetail = {
  name: string;
  email: string;
  credits: number;
};

function toUserDetail(data: unknown): UsersDetail | undefined {
  if (!data || typeof data !== "object") return undefined;
  const row = data as Record<string, unknown>;
  if (typeof row.email !== "string") return undefined;
  return {
    name: typeof row.name === "string" ? row.name : "",
    email: row.email,
    credits: Number(row.credits ?? 0) || 0,
  };
}

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const [usersDetail, setUserDetail] = useState<UsersDetail | undefined>(
    undefined
  );

  const refreshUser = useCallback(async () => {
    if (!userId) return;
    try {
      const result = await axios.get("/api/users");
      const next = toUserDetail(result.data);
      if (next) setUserDetail(next);
    } catch {
      try {
        const result = await axios.post("/api/users");
        const next = toUserDetail(result.data);
        if (next) setUserDetail(next);
      } catch {
        // Keep the last known balance if a refresh fails.
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    void refreshUser();
  }, [isLoaded, userId, refreshUser]);

  return (
    <UserDetailsContext.Provider
      value={{ usersDetail, setUserDetail, refreshUser }}
    >
      {children}
    </UserDetailsContext.Provider>
  );
}

export default Provider;
