import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ThemeToggle() {
  const { theme } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null; // No UI, just sets up the theme on initial load and when it changes
}
