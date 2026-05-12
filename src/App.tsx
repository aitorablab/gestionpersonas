import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ThemeProvider, RoleProvider } from "./hooks/useAppContext";

export default function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <RouterProvider router={router} />
      </RoleProvider>
    </ThemeProvider>
  );
}
