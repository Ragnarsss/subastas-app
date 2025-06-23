import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/";

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Clear error when user starts typing
      if (error) setError("");
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || "Error al iniciar sesión");
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
            Iniciar Sesión
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Accede a tu cuenta de SubastasApp
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
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

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            ¿No tienes cuenta?
          </Typography>
        </Divider>

        {/* Register Link */}
        <Button
          component={Link}
          to="/register"
          variant="outlined"
          size="large"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Crear cuenta nueva
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

export default Login;
