'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs';
import { UserDetailsContext } from '@/context/UserDetailsContext';
import { useSessionLogout } from '@/hooks/useSessionLogout';


export type UsersDetail = {
  name: string,
  email: string,
  credits: number
}
function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  const [usersDetail, setUserDetail] = useState<UsersDetail | undefined>(undefined)

  // Enable automatic logout when browser closes
  useSessionLogout();

  useEffect(() => {
    const CreateNewUser = async () => {
      try {
        const result = await axios.post('/api/users');
        if (result.data) {
          setUserDetail(result.data);
        }
      } catch (error) {
        // Error creating/fetching user
      }
    }
    if (user) {
      CreateNewUser();
    }
  }, [user])
  return (
    <UserDetailsContext.Provider value={{ usersDetail, setUserDetail }}>
      {children}
    </UserDetailsContext.Provider>
  )
}

export default Provider