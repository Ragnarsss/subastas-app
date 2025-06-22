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
  ButtonGroup,
  Stack,
  Divider,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  MonetizationOn as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material";

interface UserBid {
  id: string;
  auctionId: string;
  auctionTitle: string;
  auctionImage: string;
  myBid: number;
  currentBid: number;
  maxBid: number;
  bidDate: string;
  auctionEndDate: string;
  status: "winning" | "outbid" | "won" | "lost" | "cancelled";
  isHighestBidder: boolean;
}

type FilterType = "all" | "winning" | "outbid" | "won" | "lost";

function MyBids() {
  const navigate = useNavigate();
  const [bids, setBids] = useState<UserBid[]>([]);
  const [filteredBids, setFilteredBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        const mockBids: UserBid[] = [
          {
            id: "1",
            auctionId: "101",
            auctionTitle: "iPhone 15 Pro Max 256GB",
            auctionImage: "https://via.placeholder.com/150x100",
            myBid: 950000,
            currentBid: 950000,
            maxBid: 1000000,
            bidDate: "2025-01-21T10:30:00Z",
            auctionEndDate: "2025-01-25T20:00:00Z",
            status: "winning",
            isHighestBidder: true,
          },
          {
            id: "2",
            auctionId: "102",
            auctionTitle: "MacBook Air M2",
            auctionImage: "https://via.placeholder.com/150x100",
            myBid: 800000,
            currentBid: 850000,
            maxBid: 900000,
            bidDate: "2025-01-19T15:45:00Z",
            auctionEndDate: "2025-01-20T20:00:00Z",
            status: "lost",
            isHighestBidder: false,
          },
          {
            id: "3",
            auctionId: "103",
            auctionTitle: "Samsung Galaxy S24 Ultra",
            auctionImage: "https://via.placeholder.com/150x100",
            myBid: 720000,
            currentBid: 750000,
            maxBid: 800000,
            bidDate: "2025-01-20T09:20:00Z",
            auctionEndDate: "2025-01-26T18:00:00Z",
            status: "outbid",
            isHighestBidder: false,
          },
          {
            id: "4",
            auctionId: "104",
            auctionTitle: "iPad Pro 12.9 M2",
            auctionImage: "https://via.placeholder.com/150x100",
            myBid: 650000,
            currentBid: 650000,
            maxBid: 700000,
            bidDate: "2025-01-18T14:10:00Z",
            auctionEndDate: "2025-01-19T16:00:00Z",
            status: "won",
            isHighestBidder: true,
          },
        ];

        setBids(mockBids);
      } catch (error) {
        console.error("Error fetching bids:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredBids(bids);
    } else {
      setFilteredBids(bids.filter((bid) => bid.status === filter));
    }
  }, [bids, filter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CL");
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      winning: { label: "Ganando", color: "success" as const },
      outbid: { label: "Superado", color: "warning" as const },
      won: { label: "Ganada", color: "success" as const },
      lost: { label: "Perdida", color: "error" as const },
      cancelled: { label: "Cancelada", color: "default" as const },
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

  const getFilterCounts = () => {
    return {
      all: bids.length,
      winning: bids.filter((b) => b.status === "winning").length,
      outbid: bids.filter((b) => b.status === "outbid").length,
      won: bids.filter((b) => b.status === "won").length,
      lost: bids.filter((b) => b.status === "lost").length,
    };
  };

  const isAuctionActive = (endDate: string) => {
    return new Date(endDate) > new Date();
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return "Finalizada";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handlePlaceNewBid = (auctionId: string) => {
    navigate(`/auctions/${auctionId}`);
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Skeleton variant="rectangular" width={150} height={100} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Stack>
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
            Mis Ofertas
          </Typography>
          <Button
            component={Link}
            to="/auctions"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ borderRadius: 2 }}
          >
            Explorar Subastas
          </Button>
        </Box>

        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
          <ButtonGroup variant="outlined" sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => setFilter("all")}
            >
              Todas ({counts.all})
            </Button>
            <Button
              variant={filter === "winning" ? "contained" : "outlined"}
              onClick={() => setFilter("winning")}
            >
              Ganando ({counts.winning})
            </Button>
            <Button
              variant={filter === "outbid" ? "contained" : "outlined"}
              onClick={() => setFilter("outbid")}
            >
              Superadas ({counts.outbid})
            </Button>
            <Button
              variant={filter === "won" ? "contained" : "outlined"}
              onClick={() => setFilter("won")}
            >
              Ganadas ({counts.won})
            </Button>
            <Button
              variant={filter === "lost" ? "contained" : "outlined"}
              onClick={() => setFilter("lost")}
            >
              Perdidas ({counts.lost})
            </Button>
          </ButtonGroup>
        </Paper>
      </Box>

      {/* Lista de ofertas */}
      {filteredBids.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes ofertas {filter !== "all" ? `en estado ${filter}` : ""}.
          </Typography>
          <Button
            component={Link}
            to="/auctions"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ mt: 2 }}
          >
            Empezar a ofertar
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBids.map((bid) => (
            <Grid item xs={12} md={6} key={bid.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <CardMedia
                      component="img"
                      sx={{ width: 150, height: 100, borderRadius: 1 }}
                      image={bid.auctionImage}
                      alt={bid.auctionTitle}
                    />

                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          fontWeight="bold"
                          sx={{ flexGrow: 1 }}
                        >
                          {bid.auctionTitle}
                        </Typography>
                        {getStatusChip(bid.status)}
                      </Box>

                      {/* Montos */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            bgcolor: "primary.50",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <MoneyIcon fontSize="small" color="primary" />
                          <Typography variant="caption" color="text.secondary">
                            Mi oferta:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatPrice(bid.myBid)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            bgcolor: "success.50",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <GavelIcon fontSize="small" color="success" />
                          <Typography variant="caption" color="text.secondary">
                            Oferta actual:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatPrice(bid.currentBid)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            bgcolor: "warning.50",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <TrendingUpIcon fontSize="small" color="warning" />
                          <Typography variant="caption" color="text.secondary">
                            Mi límite:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatPrice(bid.maxBid)}
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ mb: 2 }} />

                      {/* Fechas */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Oferta: {formatDate(bid.bidDate)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Fin: {formatDate(bid.auctionEndDate)}
                          </Typography>
                        </Box>
                        {isAuctionActive(bid.auctionEndDate) && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TimeIcon fontSize="small" color="warning" />
                            <Typography
                              variant="caption"
                              color="warning.main"
                              fontWeight="bold"
                            >
                              {getTimeRemaining(bid.auctionEndDate)}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      {/* Acciones */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          component={Link}
                          to={`/auctions/${bid.auctionId}`}
                          variant="outlined"
                          size="small"
                          fullWidth
                        >
                          Ver Subasta
                        </Button>

                        {bid.status === "outbid" &&
                          isAuctionActive(bid.auctionEndDate) && (
                            <Button
                              onClick={() => handlePlaceNewBid(bid.auctionId)}
                              variant="contained"
                              size="small"
                              color="warning"
                            >
                              Ofertar
                            </Button>
                          )}

                        {bid.status === "winning" && (
                          <Button
                            onClick={() => handlePlaceNewBid(bid.auctionId)}
                            variant="contained"
                            size="small"
                            color="success"
                          >
                            Aumentar
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Resumen de estadísticas */}
      {bids.length > 0 && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            fontWeight="bold"
          >
            Resumen de mis ofertas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "success.50",
                }}
              >
                <TrophyIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {counts.won}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Subastas ganadas
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "warning.50",
                }}
              >
                <GavelIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {counts.winning}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Actualmente ganando
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "info.50",
                }}
              >
                <TrendingUpIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {counts.won > 0
                    ? Math.round((counts.won / bids.length) * 100)
                    : 0}
                  %
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasa de éxito
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "primary.50",
                }}
              >
                <MoneyIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ fontSize: "1.5rem" }}
                >
                  {formatPrice(
                    bids.reduce((total, bid) => total + bid.myBid, 0)
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total ofertado
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
}

export default MyBids;
