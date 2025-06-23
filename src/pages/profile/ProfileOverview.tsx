import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Chip,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Rating,
  Skeleton,
} from "@mui/material";
import {
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Gavel as GavelIcon,
  EmojiEvents as TrophyIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  MonetizationOn as MoneyIcon,
  Timeline as TimelineIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import AuthDialog from "../../components/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  rating: number;
  totalAuctions: number;
  totalBids: number;
  wonAuctions: number;
  reputation: number;
}

interface RecentActivity {
  id: string;
  type: "bid" | "auction_created" | "auction_won";
  title: string;
  amount?: number;
  date: string;
}

function ProfileOverview() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthDialog(true);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        // TODO: Fetch real activity data from API
        const mockActivity: RecentActivity[] = [
          {
            id: "1",
            type: "bid",
            title: "iPhone 15 Pro Max",
            amount: 950000,
            date: "2025-01-20T10:30:00Z",
          },
          {
            id: "2",
            type: "auction_won",
            title: "MacBook Air M2",
            amount: 850000,
            date: "2025-01-19T15:45:00Z",
          },
          {
            id: "3",
            type: "auction_created",
            title: "Samsung Galaxy S24",
            date: "2025-01-18T09:20:00Z",
          },
        ];

        setRecentActivity(mockActivity);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Show auth dialog if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <AuthDialog
        open={showAuthDialog}
        onClose={() => {
          setShowAuthDialog(false);
          navigate("/");
        }}
        title="Acceso Restringido"
        message="Para acceder a tu perfil necesitas iniciar sesión."
        action="ver tu perfil"
      />
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bid":
        return "💰";
      case "auction_created":
        return "📦";
      case "auction_won":
        return "🏆";
      default:
        return "📝";
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case "bid":
        return `Ofertaste ${formatPrice(activity.amount!)} en`;
      case "auction_created":
        return "Creaste la subasta";
      case "auction_won":
        return `Ganaste la subasta por ${formatPrice(activity.amount!)}`;
      default:
        return "Actividad en";
    }
  };

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Skeleton
                  variant="circular"
                  width={120}
                  height={120}
                  sx={{ mx: "auto", mb: 2 }}
                />
                <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
                <Skeleton variant="text" width="80%" sx={{ mx: "auto" }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="error">
              Error al cargar el perfil
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Transform user data to match ProfileOverview interface
  const profile = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "https://via.placeholder.com/150",
    joinDate: user.createdAt || "2024-01-15",
    rating: 4.8, // TODO: Get from API
    totalAuctions: 12, // TODO: Get from API
    totalBids: 45, // TODO: Get from API
    wonAuctions: 8, // TODO: Get from API
    reputation: 950, // TODO: Get from API
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Mi Perfil
        </Typography>
        <Button
          component={Link}
          to="/profile/settings"
          variant="outlined"
          startIcon={<EditIcon />}
          sx={{ borderRadius: 2 }}
        >
          Editar Perfil
        </Button>
      </Box>{" "}
      <Grid container spacing={3}>
        {/* Perfil del Usuario */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ textAlign: "center" }}>
            <CardContent sx={{ pt: 4 }}>
              <Avatar
                src={profile.avatar}
                alt={profile.name}
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  border: "4px solid",
                  borderColor: "primary.main",
                }}
              />
              <Typography
                variant="h5"
                component="h2"
                fontWeight="bold"
                gutterBottom
              >
                {profile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile.email}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Miembro desde {formatDate(profile.joinDate)}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Rating value={profile.rating} readOnly precision={0.1} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {profile.rating}/5
                </Typography>
              </Box>

              <Chip
                label={`${profile.reputation} puntos`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                fontWeight="bold"
              >
                Estadísticas
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, textAlign: "center", bgcolor: "primary.50" }}
                  >
                    <GavelIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {profile.totalAuctions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subastas Creadas
                    </Typography>
                    <Button
                      size="small"
                      component={Link}
                      to="/profile/my-auctions"
                      sx={{ mt: 1 }}
                    >
                      Ver todas
                    </Button>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, textAlign: "center", bgcolor: "success.50" }}
                  >
                    <MoneyIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {profile.totalBids}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ofertas Realizadas
                    </Typography>
                    <Button
                      size="small"
                      component={Link}
                      to="/profile/my-bids"
                      sx={{ mt: 1 }}
                    >
                      Ver todas
                    </Button>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, textAlign: "center", bgcolor: "warning.50" }}
                  >
                    <TrophyIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {profile.wonAuctions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subastas Ganadas
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2, textAlign: "center", bgcolor: "info.50" }}
                  >
                    <TimelineIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="info.main"
                    >
                      {Math.round(
                        (profile.wonAuctions / profile.totalBids) * 100
                      )}
                      %
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tasa de Éxito
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actividad Reciente */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                fontWeight="bold"
              >
                Actividad Reciente
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <Box key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1,
                            borderRadius: "50%",
                            bgcolor: "primary.50",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography sx={{ fontSize: "1.2rem" }}>
                            {getActivityIcon(activity.type)}
                          </Typography>
                        </Paper>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1">
                            {getActivityText(activity)}{" "}
                            <strong>{activity.title}</strong>
                          </Typography>
                        }
                        secondary={formatDate(activity.date)}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones Rápidas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                fontWeight="bold"
              >
                Acciones Rápidas
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <ListItemButton
                  component={Link}
                  to="/profile/items"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <ListItemIcon>
                    <InventoryIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mis Items"
                    secondary="Gestiona tus productos"
                  />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/auctions/create"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <ListItemIcon>
                    <AddIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Crear Subasta"
                    secondary="Vende tus productos"
                  />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/auctions"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <ListItemIcon>
                    <SearchIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Explorar Subastas"
                    secondary="Encuentra ofertas"
                  />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/profile/settings"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Configuración"
                    secondary="Ajusta tu cuenta"
                  />
                </ListItemButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProfileOverview;
