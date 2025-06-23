import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  MonetizationOn as MoneyIcon,
  Publish as PublishIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthDialog from "../../components/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useAuctionAPI } from "../../hooks/useAuctionAPI";
import "./CreateAuction.css";

interface AuctionForm {
  title: string;
  description: string;
  category: string;
  startingBid: string;
  duration: string;
  minBidIncrement: string;
  currency: string;
}

const categories = [
  "Electrónicos",
  "Hogar y Jardín",
  "Ropa y Accesorios",
  "Deportes",
  "Automóviles",
  "Arte y Coleccionables",
  "Libros y Música",
  "Juguetes y Juegos",
  "Salud y Belleza",
  "Otros",
];

const durations = [
  { value: "1", label: "1 día" },
  { value: "3", label: "3 días" },
  { value: "7", label: "1 semana" },
  { value: "14", label: "2 semanas" },
  { value: "30", label: "1 mes" },
];

function CreateAuction() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    createAuction,
    loading: apiLoading,
    error: apiError,
    clearError,
  } = useAuctionAPI();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AuctionForm>({
    title: "",
    description: "",
    category: "",
    startingBid: "",
    duration: "7",
    minBidIncrement: "",
    currency: "CLP",
  });
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const steps = [
    "Información Básica",
    "Detalles y Precio",
    "Revisión y Publicación",
  ];

  const handleInputChange = (field: keyof AuctionForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      clearError();

      const auctionData = {
        title: form.title,
        description: form.description,
        category: form.category,
        startingBid: parseFloat(form.startingBid),
        duration: parseInt(form.duration),
        minBidIncrement: form.minBidIncrement
          ? parseFloat(form.minBidIncrement)
          : undefined,
        currency: form.currency,
      };

      const result = await createAuction(auctionData);

      if (result.error || !result.success) {
        throw new Error(
          result.error || result.message || "Error creating auction"
        );
      }

      alert(`¡${result.message || "Subasta creada exitosamente"}!`);
      navigate("/auctions");
    } catch (error) {
      console.error("Error al crear subasta:", error);
      alert(
        `Error al crear la subasta: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return form.title.trim() !== "" && form.category !== "";
      case 1:
        return form.description.trim() !== "" && form.startingBid !== "";
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Título de la subasta"
              value={form.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ej: iPhone 15 Pro Max 256GB"
              required
              InputProps={{
                startAdornment: <GavelIcon color="action" sx={{ mr: 1 }} />,
              }}
            />

            <FormControl fullWidth required>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={form.category}
                label="Categoría"
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descripción"
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe detalladamente tu producto..."
              required
              InputProps={{
                startAdornment: (
                  <DescriptionIcon
                    color="action"
                    sx={{ mr: 1, alignSelf: "flex-start", mt: 1 }}
                  />
                ),
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="Precio inicial"
              value={form.startingBid}
              onChange={(e) => handleInputChange("startingBid", e.target.value)}
              placeholder="0"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="action" />$
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="Incremento mínimo de puja"
              value={form.minBidIncrement}
              onChange={(e) =>
                handleInputChange("minBidIncrement", e.target.value)
              }
              placeholder="Opcional - por defecto 5% del precio inicial"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="action" />$
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                value={form.currency}
                label="Moneda"
                onChange={(e) => handleInputChange("currency", e.target.value)}
              >
                <MenuItem value="USD">Dólar Americano (USD)</MenuItem>
                <MenuItem value="EUR">Euro (EUR)</MenuItem>
                <MenuItem value="CLP">Peso Chileno (CLP)</MenuItem>
                <MenuItem value="ARS">Peso Argentino (ARS)</MenuItem>
                <MenuItem value="BRL">Real Brasileño (BRL)</MenuItem>
                <MenuItem value="MXN">Peso Mexicano (MXN)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Duración de la subasta</InputLabel>
              <Select
                value={form.duration}
                label="Duración de la subasta"
                onChange={(e) => handleInputChange("duration", e.target.value)}
                startAdornment={<ScheduleIcon color="action" sx={{ mr: 1 }} />}
              >
                {durations.map((duration) => (
                  <MenuItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {apiError && (
              <Alert severity="error" onClose={clearError}>
                {apiError}
              </Alert>
            )}

            <Alert severity="success">
              ¡Revisa los detalles de tu subasta antes de publicarla!
            </Alert>

            <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                Resumen de la Subasta
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Título:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {form.title}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Categoría:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {form.category}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Precio inicial:
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="primary.main"
                  >
                    {form.currency} $
                    {parseFloat(form.startingBid || "0").toLocaleString(
                      "es-CL"
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Duración:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {durations.find((d) => d.value === form.duration)?.label}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de inicio:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date().toLocaleString("es-CL")}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de finalización:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(
                      Date.now() + parseInt(form.duration) * 24 * 60 * 60 * 1000
                    ).toLocaleString("es-CL")}
                  </Typography>
                </Grid>

                {form.minBidIncrement && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Incremento mínimo:
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="secondary.main"
                    >
                      {form.currency} $
                      {parseFloat(form.minBidIncrement).toLocaleString("es-CL")}
                    </Typography>
                  </Grid>
                )}

                {!form.minBidIncrement && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Incremento mínimo (automático):
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="secondary.main"
                    >
                      {form.currency} $
                      {(
                        parseFloat(form.startingBid || "0") * 0.05
                      ).toLocaleString("es-CL")}
                    </Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción:
                  </Typography>
                  <Typography variant="body2">{form.description}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Debug info - remove in production */}
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Datos que se enviarán a la API:
              </Typography>
              <Typography
                variant="caption"
                component="pre"
                sx={{ display: "block", mt: 1, fontSize: "0.75rem" }}
              >
                {JSON.stringify(
                  {
                    user_id: localStorage.getItem("userId") || "user_default",
                    item_id: `item_${Date.now()}`,
                    title: form.title,
                    description: form.description,
                    start_time: new Date().toISOString(),
                    end_time: new Date(
                      Date.now() + parseInt(form.duration) * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    base_price: form.startingBid,
                    min_bid_increment:
                      form.minBidIncrement ||
                      (parseFloat(form.startingBid || "0") * 0.05).toString(),
                    highest_bid: form.startingBid,
                    currency: form.currency,
                  },
                  null,
                  2
                )}
              </Typography>
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
    }
  }, [isAuthenticated]);

  // If not authenticated, show auth dialog and prevent access
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <AuthDialog
          open={showAuthDialog}
          onClose={() => {
            setShowAuthDialog(false);
            navigate("/auctions");
          }}
          title="Cuenta Requerida"
          message="Para crear una subasta necesitas tener una cuenta registrada."
          action="crear subastas"
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/auctions")}
          sx={{ mb: 2 }}
        >
          Volver a subastas
        </Button>

        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Crear Nueva Subasta
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Completa los siguientes pasos para crear tu subasta
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="body1" fontWeight={600}>
                  {label}
                </Typography>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}

                <Box sx={{ mb: 2, mt: 3 }}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Atrás
                    </Button>

                    {index === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || apiLoading || !isStepValid(index)}
                        startIcon={<PublishIcon />}
                      >
                        {loading || apiLoading
                          ? "Publicando..."
                          : "Publicar Subasta"}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!isStepValid(index)}
                      >
                        Siguiente
                      </Button>
                    )}
                  </Stack>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
}

export default CreateAuction;
