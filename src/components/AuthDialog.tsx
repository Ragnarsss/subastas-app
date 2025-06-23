import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Stack,
} from "@mui/material";
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Gavel as GavelIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  action?: string;
}

function AuthDialog({
  open,
  onClose,
  title = "Iniciar Sesión Requerido",
  message = "Para continuar necesitas iniciar sesión o crear una cuenta.",
  action = "continuar",
}: AuthDialogProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/login", { state: { from: location } });
  };

  const handleRegister = () => {
    onClose();
    navigate("/register", { state: { from: location } });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ flex: 1 }} />
          <GavelIcon color="primary" sx={{ fontSize: 40 }} />
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={onClose}
              size="small"
              sx={{ minWidth: "auto", p: 1 }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </Box>
        <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", pb: 2 }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          {message}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Para {action}, necesitas tener una cuenta activa en SubastasApp.
        </Typography>

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Iniciar Sesión
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ¿No tienes cuenta?
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            size="large"
            startIcon={<PersonAddIcon />}
            onClick={handleRegister}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Crear Cuenta Gratis
          </Button>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 3 }}
        >
          Es rápido y solo toma unos minutos
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button onClick={onClose} variant="text" color="inherit">
          Continuar navegando sin cuenta
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AuthDialog;
