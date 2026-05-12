import { createContext, useContext, useEffect, useState } from "react";
import type { Rol } from "../types";

// ─── Theme ───────────────────────────────────────────────────
interface ThemeContextType {
  dark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  dark: false,
  toggleDark: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// ─── Role ────────────────────────────────────────────────────
interface RoleContextType {
  currentRole: Rol;
  canCreate: boolean;
  canEdit: boolean;
  canDeactivate: boolean;
}

const RoleContext = createContext<RoleContextType>({
  currentRole: "Admin",
  canCreate: true,
  canEdit: true,
  canDeactivate: true,
});

// Simulated role — swap to "Editor" or "Lector" for testing
const CURRENT_ROLE: Rol = "Admin";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const currentRole = CURRENT_ROLE;
  const canCreate = currentRole === "Admin" || currentRole === "Editor";
  const canEdit = currentRole === "Admin" || currentRole === "Editor";
  const canDeactivate = currentRole === "Admin";

  return (
    <RoleContext.Provider value={{ currentRole, canCreate, canEdit, canDeactivate }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
