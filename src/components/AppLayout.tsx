import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  // TODO: Obtener usuario del contexto/estado global
  const user = {
    name: "Juan Pérez",
    avatar: "https://via.placeholder.com/40",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <Navbar user={user} />

      <Box
        component="main"
        sx={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;
