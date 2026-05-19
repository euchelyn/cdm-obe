// src/hooks/useCurrentUser.js

import { useState, useEffect } from 'react';

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(c => c.startsWith('user='));
    if (!userCookie) return;

    const token = userCookie.split('=')[1];
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    setUser(decoded);
  }, []);

  return user;
}