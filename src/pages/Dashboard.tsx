import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { lightBlue } from "@mui/material/colors";
import axios from "axios";

interface Domain {
  id: number;
  domain: string;
  customer_id: number;
}

interface Cliente {
  id: number;
  name: string;
  domain_customers: Domain[];
}


interface SuspiciousDomain {
  id: number;
  suspicious_domain: string;
  found_date: string;
  customer: {
    id: number;
    name: string;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [clientesConDominios, setClientesConDominios] = useState<Cliente[]>([]);
  const [dominiosSospechosos, setDominiosSospechosos] = useState<SuspiciousDomain[]>([]);
  const [selectedView, setSelectedView] = useState(""); // Controla la tabla a mostrar
  const [openAddCustomerPopup, setOpenAddCustomerPopup] = useState(false); // Estado para mostrar el popup "Agregar Cliente"
  const [openAddDomainPopup, setOpenAddDomainPopup] = useState(false); // Estado para mostrar el popup "Agregar Cliente"
  const [openAddAccountPopup, setOpenAddAccountPopup] = useState(false); // Estado para mostrar el popup "Agregar Cuenta"
  const [formData, setFormData] = useState({ name: "", domains: "" }); // Datos del formulario para agregar cliente
  const [addAccountData, setAddAccountData] = useState({name:"", email: "", password: "" }); // Datos del formulario para agregar cuenta

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenAddCustomerPopup  = () => setOpenAddCustomerPopup(true);
  const handleCloseAddCustomerPopup = () => {
    setFormData({ name: "", domains: "" }); // Reiniciar el formulario
    setOpenAddCustomerPopup(false);
  };

  const handleOpenAddDomainPopup = () => setOpenAddDomainPopup(true);
  const handleCloseAddDomainPopup = () => {
    setFormData({ name: "", domains: "" }); // Reiniciar el formulario
    setOpenAddDomainPopup(false);
  };

  const handleOpenAddAccountPopup = () => setOpenAddAccountPopup(true);
  const handleCloseAddAccountPopup = () => {
    setAddAccountData({ name:"", email: "", password: "" }); // Reiniciar el formulario
    setOpenAddAccountPopup(false);
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/customers/view", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Verificar si response.data es un objeto y si response.data.data es un array
      if (response.data && Array.isArray(response.data.data)) {
        setClientesConDominios(response.data.data);
        setSelectedView("dominios");
      } else {
        setClientesConDominios([]);
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      alert("Hubo un error al obtener los clientes. Verifica tu conexión o token.");
    }
  };

  const fetchSuspiciousDomains = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/suspicious-domains", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data.data)) {
        setDominiosSospechosos(response.data.data);
        setSelectedView("sospechosos");
      } else {
        console.error("La API no devuelve un array, revisa la estructura");
        setDominiosSospechosos([]);
      }

      
      
    } catch (error) {
      console.error("Error al obtener dominios sospechosos:", error);
      alert("Hubo un error al obtener los dominios sospechosos. Verifica tu conexión o token.");
    }
  };

  const handleAddCustomerSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      const domainsArray = formData.domains.split(",").map((domain) => domain.trim());
      const payload = {
        name: formData.name,
        domains: domainsArray,
      };

      await axios.post("http://127.0.0.1:8000/api/v1/addcustomer", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

  
      alert("Cliente agregado exitosamente.");
      handleCloseAddCustomerPopup(); // Cerrar el popup
    } catch (error) {
      console.error("Error al agregar cliente:", error);
      alert("Hubo un error al agregar el cliente. Intenta nuevamente.");
    }
  };

  const handleAddDomianSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      const domainsArray = formData.domains.split(",").map((domain) => domain.trim());
      const payload = {
        name: formData.name,
        domains: domainsArray,
      };

      await axios.post("http://127.0.0.1:8000/api/v1/add-domain-to-customer", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

    
      alert("Dominio Agregado exitosamente.");
      handleCloseAddDomainPopup();
    } catch (error) {
      console.error("Error al agregar cuenta:", error);
      alert("Hubo un error al agregar. Intenta nuevamente.");
    }
  };


  const handleAddAccountSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      const payload = {
        name: addAccountData.name,
        email: addAccountData.email,
        password: addAccountData.password,
      };

      await axios.post("http://127.0.0.1:8000/api/v1/auth/createaccount", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Cuenta agregada exitosamente.");
      handleCloseAddAccountPopup(); // Cerrar el popup
    } catch (error) {
      console.error("Error al agregar cuenta:", error);
      alert("Hubo un error al agregar la cuenta. Intenta nuevamente.");
    }
  };

  const renderTable = () => {
    if (selectedView === "dominios") {
      return (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Dominios</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {clientesConDominios.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.id}</TableCell>
                  <TableCell>{cliente.name}</TableCell>
                  <TableCell>
                    {cliente.domain_customers.length > 0 ? (
                      cliente.domain_customers.map((domain) => (
                        <Typography key={domain.id}>{domain.domain}</Typography>
                      ))
                    ) : (
                      "No disponible"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    if (selectedView === "sospechosos") {
      return (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Dominio Sospechoso</TableCell>
                <TableCell>Fecha Encontrado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dominiosSospechosos.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.customer.name}</TableCell>
                  <TableCell>{row.suspicious_domain}</TableCell>
                  <TableCell>{new Date(row.found_date).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return null;
  };

  return (
    <>
      <AppBar sx={{ bgcolor: lightBlue[900], margin: 0, padding: 0 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt="User Avatar"
                  src="avatar.png"
                  sx={{
                    width: 56,
                    height: 56,
                  }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleOpenAddAccountPopup}>
                <Typography textAlign="center">Agregar Cuenta</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 8, p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Welcome to the Dashboard!
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={handleOpenAddCustomerPopup}>
            Agregar Cliente y Dominios
          </Button>
          <Button variant="contained"  sx={{ bgcolor: "#009688" }}  onClick={handleOpenAddDomainPopup}>
            Agregar Mas Dominios  Validos A Cliente
          </Button>
          <Button variant="contained" color="success" onClick={fetchCustomers}>
            Ver clientes con dominios
          </Button>
          <Button variant="contained" color="secondary" onClick={fetchSuspiciousDomains}>
            Ver dominios sospechosos
          </Button>
        </Box>
        {renderTable()}
      </Box>

      {/* Popup para Agregar Cliente */}
      <Dialog open={openAddCustomerPopup} onClose={handleCloseAddCustomerPopup}>
        <DialogTitle>Agregar Cliente y Dominios</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre del Cliente"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Dominios (separados por coma)"
            fullWidth
            value={formData.domains}
            onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCustomerPopup}>Cancelar</Button>
          <Button onClick={handleAddCustomerSubmit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup para Agregar mas dominios*/}
      <Dialog open={openAddDomainPopup} onClose={handleCloseAddDomainPopup}>
        <DialogTitle>Agregar  Dominios</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre del Cliente"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Dominios (separados por coma)"
            fullWidth
            value={formData.domains}
            onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDomainPopup}>Cancelar</Button>
          <Button onClick={handleAddDomianSubmit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup para Agregar Cuenta */}
      <Dialog open={openAddAccountPopup} onClose={handleCloseAddAccountPopup}>
        <DialogTitle>Agregar Cuenta</DialogTitle>
        <DialogContent>
        <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={addAccountData.name}
            onChange={(e) => setAddAccountData({ ...addAccountData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Correo Electrónico"
            type="email"
            fullWidth
            value={addAccountData.email}
            onChange={(e) => setAddAccountData({ ...addAccountData, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Contraseña"
            type="password"
            fullWidth
            value={addAccountData.password}
            onChange={(e) => setAddAccountData({ ...addAccountData, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddAccountPopup}>Cancelar</Button>
          <Button onClick={handleAddAccountSubmit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;
