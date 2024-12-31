import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Color principal
    },
    secondary: {
      main: "#dc004e", // Color secundario
    },
  },
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
</StrictMode>
);
