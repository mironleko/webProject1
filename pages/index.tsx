import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from 'next/link';

function Index() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    const addUserAndRedirect = async () => {
      if (user) {
        try {
          const response = await fetch('/api/addUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user }),
          });

          if (response.ok) {
            router.replace('/create-competition');
          } else {
            console.error("Error while adding the user");
          }
        } catch (error) {
          console.error("There was an error:", error);
        }
      }
    };

    addUserAndRedirect();
}, [user, router]);


  if (isLoading) return <div className="text-center mt-10 text-xl">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-xl text-red-500">{error.message}</div>;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-200 to-gray-300">
      {!user ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200 hover:shadow-lg transition-shadow duration-300">
          <h1 className="text-2xl font-semibold mb-4">Please login to continue</h1>
          <Link href="api/auth/login" className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300">
            Login
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default Index;
