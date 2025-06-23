import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Avatar,
  IconButton,
  Paper,
  Stack,
  Divider,
  Alert,
  FormControl,
  FormLabel,
  FormGroup,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import AuthDialog from "../../components/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";

interface UserSettings {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    bidUpdates: boolean;
    auctionEnding: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
}

function ProfileSettings() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    notifications: {
      email: true,
      sms: false,
      push: true,
      bidUpdates: true,
      auctionEnding: true,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      allowMessages: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthDialog(true);
    }
  }, [authLoading, isAuthenticated]);

  // Load user data when available
  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "https://via.placeholder.com/150",
        // TODO: Load other settings from API
      }));
    }
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
        message="Para acceder a la configuración necesitas iniciar sesión."
        action="configurar tu perfil"
      />
    );
  }

  const handleInputChange = (field: keyof UserSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (
    field: keyof UserSettings["notifications"]
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field],
      },
    }));
  };

  const handlePrivacyChange = (field: keyof UserSettings["privacy"]) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: !prev.privacy[field],
      },
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings((prev) => ({
          ...prev,
          avatar: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Update user data via GraphQL mutation
      // For now, just simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({
        type: "success",
        text: "Configuración guardada correctamente",
      });
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar la configuración" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    ) {
      try {
        // TODO: Implement account deletion via GraphQL mutation
        alert(
          "Funcionalidad de eliminación de cuenta pendiente de implementar"
        );
      } catch (error) {
        setMessage({ type: "error", text: "Error al eliminar la cuenta" });
      }
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
          onClick={() => navigate("/profile")}
          sx={{ mb: 2 }}
        >
          Volver al perfil
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Configuración del Perfil
        </Typography>
      </Box>

      {/* Mensaje de estado */}
      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Información Personal */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                fontWeight="bold"
              >
                Información Personal
              </Typography>
              {/* Avatar */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    src={settings.avatar}
                    alt="Avatar"
                    sx={{ width: 120, height: 120, mx: "auto", mb: 1 }}
                  />
                  <IconButton
                    onClick={handleAvatarClick}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <Typography variant="caption" color="text.secondary">
                  Haz clic en el ícono para cambiar tu foto
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    value={settings.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled // Email should not be editable in most cases
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>{" "}
          {/* Notificaciones */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                fontWeight="bold"
              >
                Notificaciones
              </Typography>

              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  Configurar tus preferencias de notificación
                </FormLabel>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.email}
                        onChange={() => handleNotificationChange("email")}
                      />
                    }
                    label="Notificaciones por email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.sms}
                        onChange={() => handleNotificationChange("sms")}
                      />
                    }
                    label="Notificaciones por SMS"
                  />

                  <Divider sx={{ my: 2 }} />

                  <FormLabel
                    component="legend"
                    sx={{
                      mb: 1,
                      fontSize: "0.875rem",
                      color: "text.secondary",
                    }}
                  >
                    Notificaciones específicas de subastas
                  </FormLabel>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.push}
                        onChange={() => handleNotificationChange("push")}
                      />
                    }
                    label="Notificaciones push"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.bidUpdates}
                        onChange={() => handleNotificationChange("bidUpdates")}
                      />
                    }
                    label="Actualizaciones de ofertas"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.auctionEnding}
                        onChange={() =>
                          handleNotificationChange("auctionEnding")
                        }
                      />
                    }
                    label="Subastas próximas a terminar"
                  />
                </FormGroup>
              </FormControl>
            </CardContent>
          </Card>{" "}
          {/* Privacidad */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                fontWeight="bold"
              >
                Privacidad
              </Typography>

              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  Controla qué información es visible para otros usuarios
                </FormLabel>

                <FormGroup>
                  <FormLabel
                    component="legend"
                    sx={{
                      mb: 1,
                      fontSize: "0.875rem",
                      color: "text.secondary",
                    }}
                  >
                    Información de contacto pública
                  </FormLabel>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.showEmail}
                        onChange={() => handlePrivacyChange("showEmail")}
                      />
                    }
                    label="Mostrar email en el perfil público"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.showPhone}
                        onChange={() => handlePrivacyChange("showPhone")}
                      />
                    }
                    label="Mostrar teléfono en el perfil público"
                  />

                  <Divider sx={{ my: 2 }} />

                  <FormLabel
                    component="legend"
                    sx={{
                      mb: 1,
                      fontSize: "0.875rem",
                      color: "text.secondary",
                    }}
                  >
                    Interacciones con otros usuarios
                  </FormLabel>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.allowMessages}
                        onChange={() => handlePrivacyChange("allowMessages")}
                      />
                    }
                    label="Permitir mensajes de otros usuarios"
                  />
                </FormGroup>
              </FormControl>
            </CardContent>
          </Card>
          {/* Botones de acción */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate("/profile")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </Stack>
        </Stack>
      </form>

      {/* Zona peligrosa */}
      <Paper
        sx={{
          mt: 4,
          p: 3,
          border: "1px solid",
          borderColor: "error.light",
          bgcolor: "error.50",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <WarningIcon color="error" sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="h3"
            fontWeight="bold"
            color="error.main"
          >
            Zona Peligrosa
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Las siguientes acciones son irreversibles:
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteAccount}
          startIcon={<WarningIcon />}
        >
          Eliminar Cuenta
        </Button>
      </Paper>
    </Container>
  );
}

export default ProfileSettings;
