import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Paper,
  IconButton,
  Skeleton,
  ButtonGroup,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Gavel as GavelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MonetizationOn as MoneyIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import AuthDialog from "../../components/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useUserItems } from "../../hooks/useItems";

type FilterType = "all" | "available" | "auctioned";

function MyItems() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    items,
    availableItems,
    auctionedItems,
    loading,
    error,
    refetch,
    clearError,
  } = useUserItems();

  const [filter, setFilter] = useState<FilterType>("all");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCreateAuctionDialog, setShowCreateAuctionDialog] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthDialog(true);
    }
  }, [authLoading, isAuthenticated]);

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
        message="Para ver tus items necesitas iniciar sesión."
        action="gestionar tus items"
      />
    );
  }

  const filteredItems = () => {
    switch (filter) {
      case "available":
        return availableItems;
      case "auctioned":
        return auctionedItems;
      default:
        return items;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      available: { label: "Disponible", color: "success" as const },
      auctioned: { label: "En Subasta", color: "primary" as const },
      sold: { label: "Vendido", color: "default" as const },
      expired: { label: "Expirado", color: "error" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: "default" as const,
    };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const handleCreateAuction = (item: any) => {
    setSelectedItem(item);
    setShowCreateAuctionDialog(true);
  };

  const handleConfirmCreateAuction = () => {
    if (selectedItem) {
      navigate(`/auctions/create?itemId=${selectedItem.id}`);
    }
    setShowCreateAuctionDialog(false);
  };

  const getFilterCounts = () => {
    return {
      all: items.length,
      available: availableItems.length,
      auctioned: auctionedItems.length,
    };
  };

  const counts = getFilterCounts();

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/profile")}
          sx={{ mb: 2 }}
        >
          Volver al perfil
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Mis Items
          </Typography>
          <Button
            component={Link}
            to="/profile/items/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Nuevo Item
          </Button>
        </Box>

        {/* Error message */}
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
          <ButtonGroup variant="outlined" sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => setFilter("all")}
            >
              Todos ({counts.all})
            </Button>
            <Button
              variant={filter === "available" ? "contained" : "outlined"}
              onClick={() => setFilter("available")}
              color="success"
            >
              Disponibles ({counts.available})
            </Button>
            <Button
              variant={filter === "auctioned" ? "contained" : "outlined"}
              onClick={() => setFilter("auctioned")}
              color="primary"
            >
              En Subasta ({counts.auctioned})
            </Button>
          </ButtonGroup>
        </Paper>
      </Box>

      {/* Lista de items */}
      {filteredItems().length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <GavelIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes items {filter !== "all" ? `en estado ${filter}` : ""}
          </Typography>
          <Button
            component={Link}
            to="/profile/items/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Crear mi primer item
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredItems().map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.name}
                    sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
                  />
                  <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                    {getStatusChip(item.status)}
                  </Box>
                  <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                    <Chip
                      label={`${item.views || 0} vistas`}
                      size="small"
                      sx={{ bgcolor: "rgba(0,0,0,0.7)", color: "white" }}
                      icon={<VisibilityIcon fontSize="small" />}
                    />
                  </Box>
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.description}
                  </Typography>

                  {/* Categorías */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {item.categories.slice(0, 2).map((category, index) => (
                        <Chip
                          key={index}
                          label={category}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                      {item.categories.length > 2 && (
                        <Chip
                          label={`+${item.categories.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* Precio */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MoneyIcon fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Precio inicial:
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {formatPrice(item.initialPrice)}
                    </Typography>
                    {item.currentHighestBid && (
                      <Typography variant="body2" color="success.main">
                        Oferta actual: {formatPrice(item.currentHighestBid)}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Fecha */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Válido hasta: {formatDate(item.endDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Acciones */}
                  <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
                    {item.status === "available" && (
                      <Button
                        onClick={() => handleCreateAuction(item)}
                        variant="contained"
                        size="small"
                        startIcon={<GavelIcon />}
                        fullWidth
                      >
                        Subastar
                      </Button>
                    )}

                    {item.status === "auctioned" && (
                      <Button
                        component={Link}
                        to={`/auctions/${item.id}`}
                        variant="outlined"
                        size="small"
                        fullWidth
                      >
                        Ver Subasta
                      </Button>
                    )}

                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>

                    {item.status === "available" && (
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Auction Confirmation Dialog */}
      <Dialog
        open={showCreateAuctionDialog}
        onClose={() => setShowCreateAuctionDialog(false)}
      >
        <DialogTitle>Crear Subasta</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres crear una subasta para "
            {selectedItem?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Una vez creada la subasta, el item no podrá ser editado hasta que
            termine.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateAuctionDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmCreateAuction} variant="contained">
            Crear Subasta
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyItems;
