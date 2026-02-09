'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

/**
 * Custom hook to handle automatic logout when browser is closed
 * This works by detecting if the session token exists in sessionStorage
 * If not found on mount, it means browser was closed and reopened
 */
export function useSessionLogout() {
  const { signOut } = useClerk()
  const { isSignedIn } = useUser()

  useEffect(() => {
    if (!isSignedIn) return

    // Check if we have a session marker
    const hasSessionMarker = sessionStorage.getItem('clerk_browser_session')
    
    if (!hasSessionMarker) {
      // This is a new browser session (browser was closed and reopened)
      // Set the marker for this session
      sessionStorage.setItem('clerk_browser_session', 'active')
      
      // Check if there's a persistent Clerk session
      // If yes, sign out because browser was closed
      const hasPersistentSession = document.cookie.includes('__session')
      
      if (hasPersistentSession) {
        signOut({ redirectUrl: '/' })
      }
    }
  }, [isSignedIn, signOut])
}
