import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/DashboardPage";
import PersonasPage from "../pages/PersonasPage";
import PersonaDetailPage from "../pages/PersonaDetailPage";
import FichaPersonaPage from "../pages/FichaPersonaPage";
import PuestosPage from "../pages/PuestosPage";
import PuestoDetailPage from "../pages/PuestoDetailPage";
import ResponsabilidadesPage from "../pages/ResponsabilidadesPage";
import ResponsabilidadDetailPage from "../pages/ResponsabilidadDetailPage";
import TareasPage from "../pages/TareasPage";
import TareaDetailPage from "../pages/TareaDetailPage";
import CompetenciasPage from "../pages/CompetenciasPage";
import CompetenciaDetailPage from "../pages/CompetenciaDetailPage";
import PolivalenciaPage from "../pages/PolivalenciaPage";
import RiesgoCoberturaPage from "../pages/RiesgoCoberturaPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "personas", element: <PersonasPage /> },
      { path: "personas/:id", element: <PersonaDetailPage /> },
      { path: "ficha-persona", element: <FichaPersonaPage /> },
      { path: "puestos", element: <PuestosPage /> },
      { path: "puestos/:id", element: <PuestoDetailPage /> },
      { path: "responsabilidades", element: <ResponsabilidadesPage /> },
      { path: "responsabilidades/:id", element: <ResponsabilidadDetailPage /> },
      { path: "tareas", element: <TareasPage /> },
      { path: "tareas/:id", element: <TareaDetailPage /> },
      { path: "competencias", element: <CompetenciasPage /> },
      { path: "competencias/:id", element: <CompetenciaDetailPage /> },
      { path: "polivalencia", element: <PolivalenciaPage /> },
      { path: "riesgo", element: <RiesgoCoberturaPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);