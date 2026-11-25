'use client'
import React, { useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserDetailsContext } from '@/context/UserDetailsContext';
import { User, Mail, Coins, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import axios from 'axios';

type CreditEntry = {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdOn: string;
};

function eventLabel(type: string) {
  if (type === "signup") return "Welcome credits";
  if (type === "purchase") return "Credits purchased";
  if (type === "call") return "Voice call";
  if (type === "opening_balance") return "Starting balance";
  return type;
}

function Profile() {
  const { user } = useUser();
  const userDetailsContext = useContext(UserDetailsContext);
  const userDetails = userDetailsContext?.usersDetail;
  const [history, setHistory] = useState<CreditEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    axios
      .get("/api/credits/history")
      .then((res) => setHistory(res.data?.entries ?? []))
      .catch(() => setHistory([]));
  }, [user, userDetails?.credits]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-bold text-3xl mb-8">My Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-3xl bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-bold text-xl flex items-center gap-2 mb-2">
              <User className="h-5 w-5" />
              About Me
            </h2>
            <p className="text-sm text-muted-foreground">Your personal information</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={userDetails?.name || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Full Name</label>
                <p className="text-lg font-semibold">
                  {userDetails?.name || user?.fullName || 'Not available'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="text-lg">
                  {userDetails?.email || user?.primaryEmailAddress?.emailAddress || 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-3xl bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-bold text-xl flex items-center gap-2 mb-2">
              <Coins className="h-5 w-5" />
              Credits
            </h2>
            <p className="text-sm text-muted-foreground">1 voice call uses 1 credit</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">Available credits</label>
              <p className="text-3xl font-bold text-primary">
                {userDetails?.credits ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                New accounts start with 10 credits
              </p>
            </div>

            <Link href="/pricing">
              <Button className="w-full">Buy credits</Button>
            </Link>

            {user?.createdAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </label>
                <p className="text-lg">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border rounded-3xl bg-card p-6 shadow-sm">
        <h2 className="font-bold text-xl mb-1">Credit history</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Every signup bonus, purchase, and call is stored in your ledger.
        </p>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No credit activity yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {history.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{entry.note || eventLabel(entry.type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdOn).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={entry.amount >= 0 ? "font-semibold text-primary" : "font-semibold"}>
                    {entry.amount >= 0 ? "+" : ""}
                    {entry.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Balance {entry.balanceAfter}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Profile;
