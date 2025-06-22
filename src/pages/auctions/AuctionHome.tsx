import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Avatar,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
} from "@mui/material";
import {
  Search as SearchIcon,
  Gavel as GavelIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from "@mui/icons-material";

interface Auction {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  minBid: number;
  endDate: string;
  image: string;
  seller: {
    name: string;
    avatar?: string;
    rating: number;
  };
  totalBids: number;
  views: number;
  status: "active" | "ending_soon" | "upcoming";
  category: string;
}

type SortOption =
  | "ending_soon"
  | "highest_bid"
  | "lowest_bid"
  | "newest"
  | "most_popular";
type FilterOption = "all" | "active" | "ending_soon" | "upcoming";

function AuctionHome() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("ending_soon");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        // TODO: Reemplazar con API real
        const mockAuctions: Auction[] = [
          {
            id: "1",
            title: "iPhone 15 Pro Max 256GB",
            description:
              "Nuevo iPhone 15 Pro Max de 256GB en color azul titanio",
            currentBid: 950000,
            minBid: 800000,
            endDate: "2025-01-25T20:00:00Z",
            image: "https://via.placeholder.com/300x200",
            seller: {
              name: "Juan Pérez",
              rating: 4.8,
            },
            totalBids: 12,
            views: 156,
            status: "active",
            category: "Electrónicos",
          },
          {
            id: "2",
            title: "MacBook Air M2",
            description: "MacBook Air con chip M2, 8GB RAM, 256GB SSD",
            currentBid: 850000,
            minBid: 700000,
            endDate: "2025-01-22T15:00:00Z",
            image: "https://via.placeholder.com/300x200",
            seller: {
              name: "María González",
              rating: 4.9,
            },
            totalBids: 8,
            views: 89,
            status: "ending_soon",
            category: "Electrónicos",
          },
          {
            id: "3",
            title: "Samsung Galaxy S24 Ultra",
            description: "Samsung Galaxy S24 Ultra 512GB, color negro",
            currentBid: 720000,
            minBid: 600000,
            endDate: "2025-02-10T20:00:00Z",
            image: "https://via.placeholder.com/300x200",
            seller: {
              name: "Carlos Morales",
              rating: 4.7,
            },
            totalBids: 15,
            views: 234,
            status: "active",
            category: "Electrónicos",
          },
          {
            id: "4",
            title: "iPad Pro 12.9 M2",
            description: "iPad Pro 12.9 pulgadas con M2, 128GB",
            currentBid: 0,
            minBid: 500000,
            endDate: "2025-01-30T10:00:00Z",
            image: "https://via.placeholder.com/300x200",
            seller: {
              name: "Ana Torres",
              rating: 4.6,
            },
            totalBids: 0,
            views: 23,
            status: "upcoming",
            category: "Electrónicos",
          },
        ];

        setAuctions(mockAuctions);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  useEffect(() => {
    let filtered = auctions;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (auction) =>
          auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterBy !== "all") {
      filtered = filtered.filter((auction) => auction.status === filterBy);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "ending_soon":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "highest_bid":
          return b.currentBid - a.currentBid;
        case "lowest_bid":
          return a.currentBid - b.currentBid;
        case "most_popular":
          return b.views - a.views;
        case "newest":
        default:
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      }
    });

    setFilteredAuctions(filtered);
  }, [auctions, searchTerm, sortBy, filterBy]);

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
      active: { label: "Activa", color: "success" as const },
      ending_soon: { label: "Terminando Pronto", color: "warning" as const },
      upcoming: { label: "Próximamente", color: "info" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Chip
        label={config?.label || status}
        color={config?.color || "default"}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

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
          Subastas Activas
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Descubre productos únicos y realiza ofertas en tiempo real
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
              {auctions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subastas Activas
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {auctions.reduce((acc, auction) => acc + auction.totalBids, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ofertas Realizadas
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {auctions.filter((a) => a.status === "ending_soon").length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Terminando Pronto
            </Typography>
          </Box>
        </Stack>
      </Box>{" "}
      {/* Filtros y Búsqueda */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: "grey.50" }}>
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
              Todas ({auctions.length})
            </Button>
            <Button
              variant={filterBy === "active" ? "contained" : "outlined"}
              onClick={() => setFilterBy("active")}
              color="success"
            >
              Activas ({auctions.filter((a) => a.status === "active").length})
            </Button>
            <Button
              variant={filterBy === "ending_soon" ? "contained" : "outlined"}
              onClick={() => setFilterBy("ending_soon")}
              color="warning"
            >
              Terminando Pronto (
              {auctions.filter((a) => a.status === "ending_soon").length})
            </Button>
            <Button
              variant={filterBy === "upcoming" ? "contained" : "outlined"}
              onClick={() => setFilterBy("upcoming")}
              color="info"
            >
              Próximamente (
              {auctions.filter((a) => a.status === "upcoming").length})
            </Button>
          </ButtonGroup>
        </Box>

        <Grid container spacing={2} alignItems="center">
          {" "}
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
                <MenuItem value="active">Activas</MenuItem>
                <MenuItem value="ending_soon">Terminando Pronto</MenuItem>
                <MenuItem value="upcoming">Próximamente</MenuItem>
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
              component={Link}
              to="/auctions/create"
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
            No se encontraron subastas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "No hay subastas disponibles en este momento"}
          </Typography>
          <Button
            component={Link}
            to="/auctions/create"
            variant="contained"
            startIcon={<GavelIcon />}
          >
            Crear la primera subasta
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAuctions.map((auction) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={auction.id}>
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
                    image={auction.image}
                    alt={auction.title}
                  />
                  <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                    {getStatusChip(auction.status)}
                  </Box>
                  <Box sx={{ position: "absolute", top: 12, left: 12 }}>
                    <Chip
                      label={auction.category}
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
                  >
                    {auction.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {auction.description}
                  </Typography>{" "}
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
                    <Avatar
                      sx={{ width: 24, height: 24 }}
                      src={auction.seller.avatar}
                    >
                      {auction.seller.name.charAt(0)}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {auction.seller.name} ⭐ {auction.seller.rating}
                    </Typography>
                  </Box>
                  {/* Precio actual */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Oferta actual:
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {auction.currentBid > 0
                        ? formatPrice(auction.currentBid)
                        : "Sin ofertas"}
                    </Typography>
                  </Box>
                  {/* Estadísticas */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <TrendingUpIcon fontSize="small" color="success" />
                      <Typography variant="caption">
                        {auction.totalBids} ofertas
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <VisibilityIcon fontSize="small" color="info" />
                      <Typography variant="caption">
                        {auction.views} vistas
                      </Typography>
                    </Box>
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
                      {getTimeRemaining(auction.endDate)}
                    </Typography>
                  </Box>
                  {/* Botón de acción */}
                  <Button
                    component={Link}
                    to={`/auctions/${auction.id}`}
                    variant="contained"
                    fullWidth
                    sx={{ mt: "auto" }}
                  >
                    Ver Subasta
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default AuctionHome;
