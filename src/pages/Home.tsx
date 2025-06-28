import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
} from "@mui/material";
import {
  Gavel as GavelIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  Star as StarIcon,
} from "@mui/icons-material";

function Home() {
  const features = [
    {
      icon: <SecurityIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Seguro y Confiable",
      description:
        "Transacciones protegidas con verificación de usuarios y sistema de reputación.",
    },
    {
      icon: <SpeedIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Subastas en Tiempo Real",
      description:
        "Ofertas actualizadas instantáneamente para una experiencia competitiva.",
    },
    {
      icon: <GroupsIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Comunidad Activa",
      description:
        "Miles de usuarios comprando y vendiendo productos únicos diariamente.",
    },
  ];
  const stats = [
    {
      number: "10,000+",
      label: "Usuarios Activos",
      icon: <GroupsIcon color="primary" />,
    },
    {
      number: "5,000+",
      label: "Subastas Completadas",
      icon: <GavelIcon color="success" />,
    },
    {
      number: "50,000+",
      label: "Productos Vendidos",
      icon: <TrendingUpIcon color="warning" />,
    },
    {
      number: "4.8/5",
      label: "Calificación Promedio",
      icon: <StarIcon color="info" />,
    },
  ];

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          borderRadius: 4,
          mb: 8,
          mx: { xs: -2, sm: 0 },
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}
        >
          Bienvenido a SubastApp
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: 600, mx: "auto", mb: 4 }}
        >
          La plataforma de subastas en línea más confiable de Chile. Compra y
          vende productos únicos con total seguridad.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 6 }}
        >
          <Button
            component={Link}
            to="/auctions"
            variant="contained"
            size="large"
            startIcon={<GavelIcon />}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            Ver Subastas
          </Button>

          <Button
            component={Link}
            to="/auctions/create"
            variant="outlined"
            size="large"
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            Crear Subasta
          </Button>
        </Stack>{" "}
        {/* Estadísticas */}
        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {stat.number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          ¿Por qué elegir SubastasApp?
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          paragraph
          sx={{ maxWidth: 600, mx: "auto", mb: 6 }}
        >
          Ofrecemos la mejor experiencia de subastas en línea con tecnología
          avanzada y un enfoque en la seguridad del usuario.
        </Typography>

        <Grid container spacing={4}>
          {" "}
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  p: 3,
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Categories Section */}
      <Paper sx={{ p: 6, mb: 8, bgcolor: "grey.50" }}>
        <Typography
          variant="h4"
          component="h2"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Categorías Populares
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          paragraph
          sx={{ mb: 4 }}
        >
          Explora nuestras categorías más populares y encuentra exactamente lo
          que buscas.
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          flexWrap="wrap"
          sx={{ gap: 2 }}
        >
          {[
            'Casa',
            'Deporte',
            'Arte',
            'Herramienta',
            'Vehículo',
            'Auto',
            'Motocicleta',
            'Coleccionable',
            'Departamento',
            'Tecnología',
            'Música',
            'Otros',
          ].map((category) => (
            <Chip
              key={category}
              label={category}
              component={Link}
              to={`/auctions?category=${category.toLowerCase()}`}
              clickable
              color="primary"
              variant="outlined"
              sx={{
                fontSize: "0.9rem",
                py: 1,
                px: 2,
                "&:hover": {
                  bgcolor: "primary.50",
                },
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* CTA Section */}
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          borderRadius: 4,
          color: "white",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ¿Listo para comenzar?
        </Typography>

        <Typography
          variant="h6"
          paragraph
          sx={{ maxWidth: 500, mx: "auto", mb: 4 }}
        >
          Únete a miles de usuarios que ya están comprando y vendiendo en la
          plataforma de subastas más confiable.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          {!localStorage.getItem("access_token") && (
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                py: 1.5,
                px: 4,
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Crear Cuenta Gratis
            </Button>
          )}

          <Button
            component={Link}
            to="/auctions"
            variant="outlined"
            size="large"
            sx={{
              borderColor: "white",
              color: "white",
              py: 1.5,
              px: 4,
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Explorar Subastas
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

export default Home;
