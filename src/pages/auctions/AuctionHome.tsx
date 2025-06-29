import {
  FilterList as FilterIcon,
  Gavel as GavelIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthDialog from "../../components/AuthDialog";
import UserName from "../../components/UserName";
import { useAuth } from "../../contexts/AuthContext";
import { useItems } from "../../hooks/useItems";
import { useUserName } from "../../hooks/useUser";
import "./AuctionHome.css";

type SortOption =
  | "ending_soon"
  | "highest_bid"
  | "lowest_bid"
  | "newest"
  | "most_popular";
type FilterOption = "all" | "available" | "auctioned" | "sold" | "expired";

function AuctionHome() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("ending_soon");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Use the items hook and filter for auctioned items
  const { items, loading, error, refetch, clearError } = useItems();

  // Component interno para mostrar avatar con primera letra del nombre real
  const UserAvatar = ({ userId }: { userId: string }) => {
    const { userName } = useUserName(userId);
    const firstLetter = userName ? userName.charAt(0).toUpperCase() : userId.charAt(0).toUpperCase();
    
    return (
      <Avatar sx={{ width: 24, height: 24 }}>
        {firstLetter}
      </Avatar>
    );
  };

  // Filter auctions based on search term and local filters
  const filteredAuctions = items
    .filter((item) => {
      const matchesSearch = searchTerm
        ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      // Filter logic for item status
      let matchesFilter = false;
      if (filterBy === "all") {
        matchesFilter = true;
      } else if (filterBy === "auctioned") {
        matchesFilter = item.isAuctioned;
      } else if (filterBy === "available") {
        matchesFilter = !item.isAuctioned;
      } else if (filterBy === "expired") {
        matchesFilter = new Date(item.endDate) < new Date();
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "ending_soon":
          return (
            new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
          );
        case "highest_bid":
          return (b.currentHighestBid || b.initialPrice) - (a.currentHighestBid || a.initialPrice);
        case "lowest_bid":
          return (a.currentHighestBid || a.initialPrice) - (b.currentHighestBid || b.initialPrice);
        case "most_popular":
          return (b.views || 0) - (a.views || 0);
        case "newest":
        default:
          return (
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
          );
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return "Finalizada";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      available: { label: "Disponible", color: "info" as const },
      auctioned: { label: "En Subasta", color: "success" as const },
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

  const handleCreateAuctionClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    navigate("/auctions/create");
  };

  // Error state
  if (error && items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <GavelIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Error al cargar los items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item}>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Items y Subastas
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Descubre productos únicos disponibles y en subasta
        </Typography>

        {/* Estadísticas rápidas */}
        <Stack
          direction="row"
          spacing={4}
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {items.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items Disponibles
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {items.filter(item => item.currentHighestBid).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Con Ofertas
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {items.filter(item => item.isAuctioned).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              En Subasta
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Filtros y Búsqueda */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: "grey.50" }}>
        {/* Error message */}
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Filtros rápidos con ButtonGroup */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <FilterIcon color="primary" />
            Filtros Rápidos
          </Typography>
          <ButtonGroup
            variant="outlined"
            sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
          >
            <Button
              variant={filterBy === "all" ? "contained" : "outlined"}
              onClick={() => setFilterBy("all")}
              startIcon={<GavelIcon />}
            >
              Todas ({items.length})
            </Button>
            <Button
              variant={filterBy === "auctioned" ? "contained" : "outlined"}
              onClick={() => setFilterBy("auctioned")}
              color="success"
            >
              Subastadas (
              {items.filter(item => item.isAuctioned).length}
              )
            </Button>
          </ButtonGroup>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Buscar subastas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por estado</InputLabel>
              <Select
                value={filterBy}
                label="Filtrar por estado"
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                startAdornment={<FilterIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="auctioned">En Subasta</MenuItem>
                <MenuItem value="available">Disponibles</MenuItem>
                <MenuItem value="expired">Expiradas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                label="Ordenar por"
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="ending_soon">Terminando Pronto</MenuItem>
                <MenuItem value="highest_bid">Mayor Oferta</MenuItem>
                <MenuItem value="lowest_bid">Menor Oferta</MenuItem>
                <MenuItem value="most_popular">Más Populares</MenuItem>
                <MenuItem value="newest">Más Recientes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              onClick={handleCreateAuctionClick}
              variant="contained"
              fullWidth
              startIcon={<GavelIcon />}
              sx={{ height: 56 }}
            >
              Crear Subasta
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de Subastas */}
      {filteredAuctions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <GavelIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "No hay items disponibles en este momento"}
          </Typography>
          <Button
            onClick={handleCreateAuctionClick}
            variant="contained"
            startIcon={<GavelIcon />}
          >
            Crear el primer item
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAuctions.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image || "https://via.placeholder.com/300x200"}
                    alt={item.name}
                  />
                  <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                    {getStatusChip(item.isAuctioned ? "auctioned" : "available")}
                  </Box>
                  <Box sx={{ position: "absolute", top: 12, left: 12 }}>
                    <Chip
                      label={item.categories?.[0] || "Sin categoría"}
                      size="small"
                      sx={{ bgcolor: "rgba(0,0,0,0.7)", color: "white" }}
                    />
                  </Box>
                </Box>

                <CardContent
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    fontWeight="bold"
                    gutterBottom
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

                  {/* Información del vendedor */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                      p: 1,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                    }}
                  >
                    <PersonIcon fontSize="small" color="primary" />
                    <UserAvatar userId={item.userId} />
                    <Typography variant="caption" color="text.secondary">
                      Vendido por: <UserName userId={item.userId} />
                    </Typography>
                  </Box>

                  {/* Precio actual */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.currentHighestBid
                        ? "Último precio:"
                        : "Precio inicial:"}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {formatPrice(item.currentHighestBid || item.initialPrice)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CLP
                    </Typography>
                  </Box>

                  {/* Estadísticas */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    {/* <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <TrendingUpIcon fontSize="small" color="success" />
                      <Typography variant="caption">
                        {item.currentHighestBid ? "1" : "0"} ofertas
                      </Typography>
                    </Box> */}
                    {/* <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <VisibilityIcon fontSize="small" color="info" />
                      <Typography variant="caption">
                        {item.views || 0} vistas
                      </Typography>
                    </Box> */}
                  </Stack>

                  {/* Tiempo restante */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 2,
                    }}
                  >
                    <TimeIcon fontSize="small" color="warning" />
                    <Typography
                      variant="caption"
                      color="warning.main"
                      fontWeight="bold"
                    >
                      {getTimeRemaining(item.endDate)}
                    </Typography>
                  </Box>

                  {/* Botón de acción */}
                  <Button
                    component={Link}
                    to={`/auctions/${item._id}`}
                    variant="contained"
                    fullWidth
                    sx={{ mt: "auto" }}
                  >
                    Ver Item
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Refresh button */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="outlined"
          onClick={() => refetch()}
          disabled={loading}
          startIcon={loading ? undefined : <GavelIcon />}
        >
          {loading ? "Cargando..." : "Actualizar Items"}
        </Button>
      </Box>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        title="Crear Cuenta para Subastar"
        message="Para crear subastas necesitas tener una cuenta registrada en SubastasApp."
        action="crear y gestionar subastas"
      />
    </Container>
  );
}

export default AuctionHome;
