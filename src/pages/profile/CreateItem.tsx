import React, { useState, useEffect } from "react";
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
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  InputAdornment,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  MonetizationOn as MoneyIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import AuthDialog from "../../components/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useUserItems } from "../../hooks/useItems";

interface ItemForm {
  name: string;
  description: string;
  initialPrice: string;
  endDate: string;
  categories: string[];
}

const availableCategories = [
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

function CreateItem() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    createItem,
    loading: apiLoading,
    error: apiError,
    clearError,
  } = useUserItems();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [form, setForm] = useState<ItemForm>({
    name: "",
    description: "",
    initialPrice: "",
    endDate: "",
    categories: [],
  });

  const steps = [
    "Información Básica",
    "Detalles y Precio",
    "Revisión y Guardar",
  ];

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
          navigate("/profile");
        }}
        title="Acceso Restringido"
        message="Para crear items necesitas iniciar sesión."
        action="crear items"
      />
    );
  }

  const handleInputChange = (
    field: keyof ItemForm,
    value: string | string[]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoriesChange = (
    event: SelectChangeEvent<typeof form.categories>
  ) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      categories: typeof value === "string" ? value.split(",") : value,
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

      const itemData = {
        name: form.name,
        description: form.description,
        initialPrice: parseFloat(form.initialPrice),
        endDate: form.endDate,
        categories: form.categories,
      };

      const result = await createItem(itemData);

      if (result.success) {
        alert("¡Item creado exitosamente!");
        navigate("/profile/items");
      } else {
        throw new Error(result.error || "Error al crear el item");
      }
    } catch (error) {
      console.error("Error al crear item:", error);
      alert(
        `Error al crear el item: ${
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
        return form.name.trim() !== "" && form.categories.length > 0;
      case 1:
        return (
          form.description.trim() !== "" &&
          form.initialPrice !== "" &&
          form.endDate !== ""
        );
      case 2:
        return true;
      default:
        return false;
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "0";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(numPrice);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nombre del item"
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: iPhone 15 Pro Max 256GB"
              required
              InputProps={{
                startAdornment: <InventoryIcon color="action" sx={{ mr: 1 }} />,
              }}
            />

            <FormControl fullWidth required>
              <InputLabel>Categorías</InputLabel>
              <Select
                multiple
                value={form.categories}
                onChange={handleCategoriesChange}
                input={<OutlinedInput label="Categorías" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableCategories.map((category) => (
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
              placeholder="Describe detalladamente tu item..."
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
              value={form.initialPrice}
              onChange={(e) =>
                handleInputChange("initialPrice", e.target.value)
              }
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
              type="datetime-local"
              label="Fecha límite"
              value={form.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
              }}
              InputProps={{
                startAdornment: <ScheduleIcon color="action" sx={{ mr: 1 }} />,
              }}
              helperText="Fecha hasta la cual el item estará disponible"
            />
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

            <Alert severity="info">
              ¡Revisa los detalles de tu item antes de guardarlo!
            </Alert>

            <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                Resumen del Item
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nombre:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {form.name}
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
                    {formatPrice(form.initialPrice)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha límite:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {form.endDate
                      ? new Date(form.endDate).toLocaleString("es-CL")
                      : "No especificada"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Categorías:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {form.categories.map((category) => (
                      <Chip
                        key={category}
                        label={category}
                        size="small"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción:
                  </Typography>
                  <Typography variant="body2">{form.description}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography>Cargando...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/profile/items")}
          sx={{ mb: 2 }}
        >
          Volver a mis items
        </Button>

        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Crear Nuevo Item
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Crea un item que podrás usar después para crear subastas
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
                        startIcon={<SaveIcon />}
                      >
                        {loading || apiLoading
                          ? "Guardando..."
                          : "Guardar Item"}
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

export default CreateItem;
