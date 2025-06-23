import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "./Navbar";
import { useAuth } from "../contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

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
