"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard on mount
    router.push("/dashboard");
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight flex items-center gap-3 justify-center mb-4">
          OwnIt <Heart className="w-10 h-10 fill-green-600 text-green-600" />
        </h1>
            <p className="text-gray-600 mb-4">
          Redirecting to dashboard...
            </p>
          </div>
    </main>
  );
}
