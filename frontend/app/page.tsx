"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={handleLoginRedirect}
        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
      >
        Login
      </button>
    </div>
  );
}
