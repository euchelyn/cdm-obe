"use client";

import React from "react";
import { api_register, api_login } from "../../services/authService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MISPage() {
  const router = useRouter();

  // 🔐 LOGIN TEST
  const handleLogin = async () => {
    const res = await api_login("student", "student");

    if (!res.ok) {
      toast.error(res.error || "Login failed");
      return;
    }

    toast.success("Login successful 🚀", {
      description: "Redirecting to dashboard...",
    });

    setTimeout(() => {
      router.push(res.redirectPath);
    }, 1000);
  };

  // 🧾 REGISTER TEST
  const handleRegister = async () => {
    const res = await api_register("registrar", "registrar");

    if (!res.ok) {
      toast.error(res.error || "Registration failed");
      return;
    }

    toast.success("User registered 🎉", {
      description: "You can now login.",
    });
  };

  // 🧪 PURE UI TEST (just for experimenting)
  const testToaster = () => {
    toast.success("System check OK", {
      description: "All services running smoothly.",
    });
  };

  return (
    <div className="flex flex-col gap-3 p-6">
      
      <button onClick={testToaster} className="px-4 py-2 bg-black text-white rounded-lg">
        Test Toast
      </button>

      <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Test Login
      </button>

      <button onClick={handleRegister} className="px-4 py-2 bg-green-600 text-white rounded-lg">
        Test Register
      </button>

    </div>
  );
}