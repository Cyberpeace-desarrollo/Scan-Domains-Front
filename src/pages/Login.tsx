import React, { useState } from "react";
import { TextField, Button, Typography, Box, Card } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const baseURL = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>(""); 
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null); // Manejo de errores
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${baseURL}/api/v1/auth/login`, {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err: unknown) {
      // Manejar errores
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Errores del backend
          setError(err.response.data.message || "Credenciales inválidas");
        } else if (err.request) {
          // Errores de red
          setError(
            "No se pudo conectar al servidor. Verifica tu red"
          );
        } else {
          // Otros errores
          setError(err.message);
        }
      } else {
        setError("Ocurrió un error desconocido.");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" textAlign="center" gutterBottom>
          Login
        </Typography>
        {error && (
          <Typography
            variant="body2"
            color="error"
            textAlign="center"
            gutterBottom
          >
            {error}
          </Typography>
        )}
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
          >
            Login
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
