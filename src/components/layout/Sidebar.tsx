import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, ClipboardList,
  CheckSquare, Award, BarChart2, Moon, Sun, ChevronRight,
  Shield, FileText
} from "lucide-react";
import { useTheme, useRole } from "../../hooks/useAppContext";

const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Maestros",
    items: [
      { to: "/personas", label: "Personas", icon: Users },
      { to: "/puestos", label: "Puestos", icon: Briefcase },
      { to: "/responsabilidades", label: "Responsabilidades", icon: ClipboardList },
      { to: "/tareas", label: "Tareas", icon: CheckSquare },
      { to: "/competencias", label: "Competencias", icon: Award },
    ],
  },
  {
    label: "Análisis",
    items: [
      { to: "/polivalencia", label: "Matriz polivalencia", icon: BarChart2 },
      { to: "/riesgo", label: "Riesgo de cobertura", icon: Shield },
      { to: "/ficha-persona", label: "Ficha persona", icon: FileText },
    ],
  },
];

export default function Sidebar() {
  const { dark, toggleDark } = useTheme();
  const { currentRole } = useRole();
  const location = useLocation();

  const roleBadge: Record<string, string> = {
    Admin: "bg-mint-100 text-mint-700 dark:bg-mint-900/40 dark:text-mint-400",
    Editor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    Lector: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <img src="/src/assets/logo.png" alt="A&B" className="w-12 h-12 rounded-xl object-cover" />
<div>
  <p className="text-[16px] font-bold text-slate-800 dark:text-slate-100 leading-tight">PersonasPro</p>
  <p className="text-[10px] text-slate-400 leading-tight">Gestión de personas</p>
</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon }) => {
                const isActive = to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight size={14} className="opacity-50" />}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {/* Role badge */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users size={13} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">Mi perfil</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleBadge[currentRole]}`}>
              {currentRole}
            </span>
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="sidebar-link w-full"
        >
          {dark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          <span>{dark ? "Modo claro" : "Modo oscuro"}</span>
        </button>
      </div>
    </aside>
  );
}
