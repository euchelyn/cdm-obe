'use client';

import React from 'react';
import { check_base } from '../helper/auth';
import { api_register } from '../helper/auth';
import { api_login } from '../helper/auth';
import { useRouter } from 'next/navigation';

export default function MISPage() {
  const router = useRouter();

  const handleLogin = async () => {
    const res =  await api_login("student", "student");

    if (!res.ok) {
      console.log(res.error);
      return;
    }

    router.push(res.redirectPath);
  };

  const handleRegister = async () => {
    const res = await api_register("registrar", "registrar");

    if (!res.ok) {
      console.log(res.error);
      return;
    }

  }

  return (
    <>
        <button
            onClick={handleRegister}
        >
            Click Me
        </button>
    </>
  );
}