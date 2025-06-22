import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    primary: {
      main: string;
      light: string;
      dark: string;
      50: string;
    };
    success: {
      main: string;
      light: string;
      dark: string;
      50: string;
    };
    warning: {
      main: string;
      light: string;
      dark: string;
      50: string;
    };
    info: {
      main: string;
      light: string;
      dark: string;
      50: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
      50: string;
    };
    grey: {
      50: string;
    };
  }

  interface PaletteOptions {
    primary?: {
      main?: string;
      light?: string;
      dark?: string;
      50?: string;
    };
    success?: {
      main?: string;
      light?: string;
      dark?: string;
      50?: string;
    };
    warning?: {
      main?: string;
      light?: string;
      dark?: string;
      50?: string;
    };
    info?: {
      main?: string;
      light?: string;
      dark?: string;
      50?: string;
    };
    error?: {
      main?: string;
      light?: string;
      dark?: string;
      50?: string;
    };
    grey?: {
      50?: string;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      50: "#e3f2fd",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
    },
    success: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20",
      50: "#e8f5e8",
    },
    warning: {
      main: "#ed6c02",
      light: "#ff9800",
      dark: "#e65100",
      50: "#fff3e0",
    },
    info: {
      main: "#0288d1",
      light: "#03a9f4",
      dark: "#01579b",
      50: "#e1f5fe",
    },
    error: {
      main: "#d32f2f",
      light: "#f44336",
      dark: "#c62828",
      50: "#ffebee",
    },
    grey: {
      50: "#fafafa",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 16,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 24px",
        },
        contained: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
