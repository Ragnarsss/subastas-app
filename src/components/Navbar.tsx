import {
  Add as AddIcon,
  Gavel as GavelIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthDialog from "./AuthDialog";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
}

function Navbar({ user = null }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { logout } = useAuth();

  const [mobileMenuAnchor, setMobileMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    handleProfileMenuClose();
  };

  const handleCreateAuctionClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    navigate("/auctions/create");
  };

  const navigationItems = [
    { path: "/", label: "Inicio", icon: <HomeIcon /> },
    { path: "/auctions", label: "Subastas", icon: <GavelIcon /> },
    {
      path: "/auctions/create",
      label: "Crear Subasta",
      icon: <AddIcon />,
      onClick: handleCreateAuctionClick,
      requiresAuth: true,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "grey.200",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo/Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GavelIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                textDecoration: "none",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              SubastasApp
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={item.onClick || (() => navigate(item.path))}
                  startIcon={item.icon}
                  variant={isActive(item.path) ? "contained" : "text"}
                  color={isActive(item.path) ? "primary" : "inherit"}
                  sx={{
                    mx: 0.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* User Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user ? (
              <>
                {/* User Profile Menu */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {!isMobile && (
                    <Chip
                      label={`Hola, ${user.name.split(" ")[0]}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
                    <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Box>

                {/* Profile Menu */}
                <Menu
                  anchorEl={profileMenuAnchor}
                  open={Boolean(profileMenuAnchor)}
                  onClose={handleProfileMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      handleProfileMenuClose();
                    }}
                  >
                    <PersonIcon sx={{ mr: 1 }} />
                    Mi Perfil
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/profile/auctions");
                      handleProfileMenuClose();
                    }}
                  >
                    <GavelIcon sx={{ mr: 1 }} />
                    Mis Subastas
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {/* Login/Register Buttons */}
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Registrarse
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={handleMobileMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            sx={{ mt: 1 }}
          >
            {navigationItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    navigate(item.path);
                  }
                  handleMobileMenuClose();
                }}
                selected={isActive(item.path)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {item.icon}
                  {item.label}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        title="Iniciar Sesión para Crear Subastas"
        message="Para crear y gestionar subastas necesitas tener una cuenta."
        action="crear subastas"
      />
    </AppBar>
  );
}

export default Navbar;
