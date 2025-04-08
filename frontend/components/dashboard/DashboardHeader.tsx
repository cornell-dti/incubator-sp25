"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { logout } = useAuth();

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Button variant="outline" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
