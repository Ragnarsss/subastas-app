import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardMedia,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Gavel as GavelIcon,
  Preview as PreviewIcon,
  Publish as PublishIcon,
  MonetizationOn as MoneyIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";

interface AuctionForm {
  title: string;
  description: string;
  category: string;
  startingBid: string;
  duration: string;
  images: File[];
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
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AuctionForm>({
    title: "",
    description: "",
    category: "",
    startingBid: "",
    duration: "7",
    images: [],
  });

  const steps = [
    "Información Básica",
    "Detalles y Precio",
    "Imágenes",
    "Revisión y Publicación",
  ];

  const handleInputChange = (field: keyof AuctionForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...files].slice(0, 5), // Máximo 5 imágenes
      }));
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
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

      // TODO: Implementar llamada a API
      console.log("Crear subasta:", form);

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("¡Subasta creada exitosamente!");
      navigate("/auctions");
    } catch (error) {
      console.error("Error al crear subasta:", error);
      alert("Error al crear la subasta");
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
        return form.images.length > 0;
      case 3:
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
            <Alert severity="info">
              Puedes subir hasta 5 imágenes. La primera imagen será la
              principal.
            </Alert>

            <Box>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                  disabled={form.images.length >= 5}
                >
                  {form.images.length > 0
                    ? `Agregar más imágenes (${form.images.length}/5)`
                    : "Subir imágenes"}
                </Button>
              </label>
            </Box>

            {/* Botón alternativo con PhotoCameraIcon */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="text"
                startIcon={<PhotoCameraIcon />}
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={form.images.length >= 5}
              >
                Desde Cámara
              </Button>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => {
                  // TODO: Vista previa de imágenes
                  console.log("Vista previa");
                }}
                disabled={form.images.length === 0}
              >
                Vista Previa
              </Button>
            </Box>

            {form.images.length > 0 && (
              <Grid container spacing={2}>
                {form.images.map((image, index) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={index}>
                    <Card sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height={120}
                        image={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        {index === 0 && (
                          <Chip
                            label="Principal"
                            color="primary"
                            size="small"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          sx={{ minWidth: "auto", p: 0.5 }}
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Alert severity="success">
              ¡Revisa los detalles de tu subasta antes de publicarla!
            </Alert>

            <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                Resumen de la Subasta
              </Typography>{" "}
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
                    ${parseInt(form.startingBid || "0").toLocaleString("es-CL")}
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

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción:
                  </Typography>
                  <Typography variant="body2">{form.description}</Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Imágenes ({form.images.length}):
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
                    {form.images.map((image, index) => (
                      <Card key={index} sx={{ minWidth: 60 }}>
                        <CardMedia
                          component="img"
                          height={60}
                          image={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                        />
                      </Card>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

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
                        disabled={loading || !isStepValid(index)}
                        startIcon={<PublishIcon />}
                      >
                        {loading ? "Publicando..." : "Publicar Subasta"}
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
