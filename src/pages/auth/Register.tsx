import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  Stack,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonAdd as PersonAddIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Clear error when user starts typing
      if (error) setError("");
    };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return false;
    }

    if (!formData.email) {
      setError("El correo electrónico es requerido");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("El correo electrónico no es válido");
      return false;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.error || "Error al crear la cuenta");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <GavelIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Crear Cuenta
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Únete a la comunidad de SubastasApp
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nombre completo"
              value={formData.name}
              onChange={handleChange("name")}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange("password")}
              required
              helperText="Mínimo 6 caracteres"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Acepto los{" "}
                  <Link
                    to="/terms"
                    style={{ color: "inherit", textDecoration: "underline" }}
                  >
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    to="/privacy"
                    style={{ color: "inherit", textDecoration: "underline" }}
                  >
                    política de privacidad
                  </Link>
                </Typography>
              }
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={<PersonAddIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes cuenta?
          </Typography>
        </Divider>

        {/* Login Link */}
        <Button
          component={Link}
          to="/login"
          variant="outlined"
          size="large"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Iniciar sesión
        </Button>

        {/* Back to Home */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            component={Link}
            to="/"
            variant="text"
            size="small"
            color="inherit"
            sx={{ color: "text.secondary" }}
          >
            ← Volver al inicio
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
