import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from 'next/link';

function Index() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Call the API route to ensure user is added to the database
      fetch('/api/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      });

      router.push('/create-competition');
    }
  }, [user, router]);

  if (isLoading) return <div className="text-center mt-10 text-xl">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-xl text-red-500">{error.message}</div>;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {user ? (
        <div className="bg-white p-8 rounded shadow-md text-center">
          <h1 className="text-2xl mb-4">Welcome, {user.name}!</h1>
          <p className="mb-4">Your nickname is {user.nickname}.</p>
          <Link href="api/auth/logout" className="text-blue-500 hover:underline">
            Logout
          </Link>
        </div>
      ) : (
        <div className="bg-white p-8 rounded shadow-md text-center">
          <h1 className="text-2xl mb-4">Please login to continue</h1>
          <Link href="api/auth/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default Index;
