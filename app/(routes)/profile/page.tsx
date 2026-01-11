'use client'
import React, { useContext } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserDetailsContext } from '@/context/UserDetailsContext';
import { User, Mail, Coins, Calendar } from 'lucide-react';

function Profile() {
  const { user } = useUser();
  const userDetailsContext = useContext(UserDetailsContext);
  const userDetails = userDetailsContext?.usersDetail;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-bold text-3xl mb-8">My Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <div className="border rounded-3xl bg-secondary p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-bold text-xl flex items-center gap-2 mb-2">
              <User className="h-5 w-5" />
              About Me
            </h2>
            <p className="text-sm text-gray-500">Your personal information</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={userDetails?.name || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
                <p className="text-lg font-semibold">
                  {userDetails?.name || user?.fullName || 'Not available'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
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

        {/* Account Stats Card */}
        <div className="border rounded-3xl bg-secondary p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-bold text-xl flex items-center gap-2 mb-2">
              <Coins className="h-5 w-5" />
              Account Details
            </h2>
            <p className="text-sm text-gray-500">Your account statistics</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">Available Credits</label>
              <p className="text-3xl font-bold text-blue-600">
                {userDetails?.credits ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Credits remaining for consultations
              </p>
            </div>
            
            {user?.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
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

      {/* Additional Information */}
      {user && (
        <div className="border rounded-3xl bg-secondary p-6 shadow-sm mt-6">
          <div className="mb-6">
            <h2 className="font-bold text-xl mb-2">Account Information</h2>
            <p className="text-sm text-gray-500">Additional account details</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">User ID</label>
              <p className="text-sm font-mono text-gray-700 break-all">
                {user.id}
              </p>
            </div>
            
            {user.username && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Username</label>
                <p className="text-lg">{user.username}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
