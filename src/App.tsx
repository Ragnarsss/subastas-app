import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./theme";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";

// Páginas
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuctionHome from "./pages/auctions/AuctionHome";
import AuctionDetail from "./pages/auctions/AuctionDetail";
import CreateAuction from "./pages/auctions/CreateAuction";
import ProfileOverview from "./pages/profile/ProfileOverview";
import MyAuctions from "./pages/profile/MyAuctions";
import MyBids from "./pages/profile/MyBids";
import ProfileSettings from "./pages/profile/ProfileSettings";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppLayout>
            <Routes>
              {/* Página principal */}
              <Route path="/" element={<Home />} />

              {/* Rutas de autenticación */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rutas de subastas */}
              <Route path="/auctions" element={<AuctionHome />} />
              <Route path="/auctions/:id" element={<AuctionDetail />} />
              <Route path="/auctions/create" element={<CreateAuction />} />

              {/* Rutas de perfil */}
              <Route path="/profile" element={<ProfileOverview />} />
              <Route path="/profile/auctions" element={<MyAuctions />} />
              <Route path="/profile/bids" element={<MyBids />} />
              <Route path="/profile/settings" element={<ProfileSettings />} />

              {/* Ruta por defecto */}
              <Route path="*" element={<Home />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
