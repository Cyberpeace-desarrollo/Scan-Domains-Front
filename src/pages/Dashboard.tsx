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
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { lightBlue } from "@mui/material/colors";
import { Search, DarkMode, LightMode, ManageAccounts } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL;

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
  photo_url: string;
}

interface User {
  name: string;
  email: string;
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
  const [filteredDominiosSospechosos, setFilteredDominiosSospechosos] = useState<SuspiciousDomain[]>([]);
  const [selectedView, setSelectedView] = useState(""); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [darkMode, setDarkMode] = useState(false); 
  const [openImageDialog, setOpenImageDialog] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(""); 
  const [openAddCustomerPopup, setOpenAddCustomerPopup] = useState(false); 
  const [openAddDomainPopup, setOpenAddDomainPopup] = useState(false); 
  const [openUserManagementPopup, setOpenUserManagementPopup] = useState(false); 
  const [formData, setFormData] = useState({ name: "", domains: "" }); 
  const [addAccountData, setAddAccountData] = useState({ name: "", email: "", password: "" }); 
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('localUsers');
    return savedUsers ? JSON.parse(savedUsers) : [];
  }); 
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false); 
  const [userToDelete, setUserToDelete] = useState<User | null>(null); 
  const [openChangePasswordPopup, setOpenChangePasswordPopup] = useState(false); 
  const [passwordData, setPasswordData] = useState({ password: "", confirmPassword: "" }); 
  const [userManagementTab, setUserManagementTab] = useState(0); 

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenAddCustomerPopup = () => setOpenAddCustomerPopup(true);
  const handleCloseAddCustomerPopup = () => {
    setFormData({ name: "", domains: "" });
    setOpenAddCustomerPopup(false);
  };

  const handleOpenAddDomainPopup = () => setOpenAddDomainPopup(true);
  const handleCloseAddDomainPopup = () => {
    setFormData({ name: "", domains: "" });
    setOpenAddDomainPopup(false);
  };

  const handleOpenUserManagementPopup = () => {
    setOpenUserManagementPopup(true);
  };

  const handleCloseUserManagementPopup = () => setOpenUserManagementPopup(false);

  const handleOpenChangePasswordPopup = () => {
    setOpenChangePasswordPopup(true);
  };

  const handleCloseChangePasswordPopup = () => {
    setOpenChangePasswordPopup(false);
    setPasswordData({ password: "", confirmPassword: "" });
  };

  const handleOpenDeleteUserDialog = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteUserDialog(true);
  };

  const handleCloseDeleteUserDialog = () => {
    setOpenDeleteUserDialog(false);
    setUserToDelete(null);
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedImage("");
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredDominiosSospechosos(dominiosSospechosos);
    } else {
      const filtered = dominiosSospechosos.filter((row) =>
        row.suspicious_domain.toLowerCase().includes(term) ||
        row.customer.name.toLowerCase().includes(term) ||
        new Date(row.found_date).toLocaleString().toLowerCase().includes(term)
      );
      setFilteredDominiosSospechosos(filtered);
    }
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await axios.get(`${baseURL}/api/v1/customers/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      const response = await axios.get(`${baseURL}/api/v1/suspicious-domains`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data.data)) {
        setDominiosSospechosos(response.data.data);
        setFilteredDominiosSospechosos(response.data.data);
        setSelectedView("sospechosos");
        setSearchTerm(""); 
      } else {
        console.error("La API no devuelve un array, revisa la estructura");
        setDominiosSospechosos([]);
        setFilteredDominiosSospechosos([]);
      }
      
    } catch (error) {
      console.error("Error al obtener dominios sospechosos:", error);
      alert("Hubo un error al obtener los dominios sospechosos. Verifica tu conexión o token.");
    }
  };

  const handleDeleteUserSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token || !userToDelete) {
      alert("Token no encontrado o usuario no seleccionado.");
      return;
    }

    try {
      await axios.delete(`${baseURL}/api/v1/auth/delete-account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { email: userToDelete.email }
      });

      // Eliminar el usuario del estado local y localStorage
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(user => user.email !== userToDelete.email);
        localStorage.setItem('localUsers', JSON.stringify(updatedUsers));
        return updatedUsers;
      });

      alert("Usuario eliminado exitosamente.");
      handleCloseDeleteUserDialog();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Hubo un error al eliminar el usuario. Intenta nuevamente.");
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

      await axios.post(`${baseURL}/api/v1/addcustomer`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Cliente agregado exitosamente.");
      handleCloseAddCustomerPopup();
    } catch (error) {
      console.error("Error al agregar cliente:", error);
      alert("Hubo un error al agregar el cliente. Intenta nuevamente.");
    }
  };

  const handleAddDomainSubmit = async () => {
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

      await axios.post(`${baseURL}/api/v1/add-domain-to-customer`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Dominio Agregado exitosamente.");
      handleCloseAddDomainPopup();
    } catch (error) {
      console.error("Error al agregar dominio:", error);
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

      await axios.post(`${baseURL}/api/v1/auth/createaccount`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Agregar el usuario al estado local y localStorage
      const newUser = { name: addAccountData.name, email: addAccountData.email };
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers, newUser];
        localStorage.setItem('localUsers', JSON.stringify(updatedUsers));
        return updatedUsers;
      });

      alert("Cuenta agregada exitosamente.");
      setAddAccountData({ name: "", email: "", password: "" });
    } catch (error) {
      console.error("Error al agregar cuenta:", error);
      alert("Hubo un error al agregar la cuenta. Intenta nuevamente.");
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (passwordData.password !== passwordData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      await axios.post(`${baseURL}/api/v1/auth/change-password`, {
        password: passwordData.password,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Contraseña cambiada exitosamente.");
      handleCloseChangePasswordPopup();
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      alert("Hubo un error al cambiar la contraseña. Intenta nuevamente.");
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

    const BASE_URL = "http://127.0.0.1:8000/uploads/";
    if (selectedView === "sospechosos") {
      return (
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3,
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: 2,
            p: 2
          }}>
            <TextField
              variant="outlined"
              placeholder="🔍 Buscar por dominio, cliente o fecha..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                width: '100%', 
                maxWidth: 600,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#fff',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : '#f8f9fa',
                  },
                  '&.Mui-focused': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : '#fff',
                    boxShadow: darkMode ? '0 0 0 2px rgba(144, 202, 249, 0.2)' : '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: darkMode ? '#90caf9' : '#1976d2' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            {filteredDominiosSospechosos.length} dominios encontrados
            {searchTerm && ` para "${searchTerm}"`}
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Dominio Sospechoso</TableCell>
                  <TableCell>Fecha Encontrado</TableCell>
                  <TableCell>Captura Tomada Del Sitio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDominiosSospechosos.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.customer.name}</TableCell>
                    <TableCell>{row.suspicious_domain}</TableCell>
                    <TableCell>{new Date(row.found_date).toLocaleString()}</TableCell>
                    <TableCell>
                      {row.photo_url ? (
                        <img
                          src={`${BASE_URL}${row.photo_url}`}
                          alt="Captura del sitio"
                          style={{ 
                            width: 100, 
                            height: 100, 
                            objectFit: "cover", 
                            borderRadius: 8,
                            cursor: "pointer"
                          }}
                          onClick={() => handleImageClick(`${BASE_URL}${row.photo_url}`)}
                        />
                      ) : (
                        "No disponible"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    }

    return null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              <MenuItem sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                background: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                borderRadius: 1,
                mx: 1,
                my: 0.5
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  minWidth: 200
                }}>
                  {darkMode ? <DarkMode sx={{ color: '#90caf9' }} /> : <LightMode sx={{ color: '#f57c00' }} />}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkMode}
                        onChange={handleThemeToggle}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#90caf9',
                            '&:hover': {
                              backgroundColor: 'rgba(144, 202, 249, 0.08)',
                            },
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#1976d2',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {darkMode ? "Modo Oscuro" : "Modo Claro"}
                      </Typography>
                    }
                    sx={{ margin: 0 }}
                  />
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleOpenUserManagementPopup}>
                <ManageAccounts sx={{ mr: 1 }} />
                <Typography textAlign="center">Gestión de Usuarios</Typography>
              </MenuItem>
              <MenuItem onClick={handleOpenChangePasswordPopup}>
                <Typography textAlign="center">Cambiar Contraseña</Typography>
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
        <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={handleOpenAddCustomerPopup}>
            Agregar Cliente y Dominios
          </Button>
          <Button variant="contained" sx={{ bgcolor: "#009688" }} onClick={handleOpenAddDomainPopup}>
            Agregar Más Dominios a Cliente
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

      <Dialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Captura del Sitio Web</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <img
              src={selectedImage}
              alt="Captura ampliada del sitio"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh', 
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openUserManagementPopup} 
        onClose={handleCloseUserManagementPopup}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ManageAccounts />
          Gestión de Usuarios
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Tabs value={userManagementTab} onChange={(e, newValue) => setUserManagementTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Crear Cuenta" />
            <Tab label="Eliminar Cuenta" />
          </Tabs>
          
          {userManagementTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Crear Nueva Cuenta</Typography>
              <TextField
                margin="dense"
                label="Nombre"
                type="text"
                fullWidth
                value={addAccountData.name}
                onChange={(e) => setAddAccountData({ ...addAccountData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Correo Electrónico"
                type="email"
                fullWidth
                value={addAccountData.email}
                onChange={(e) => setAddAccountData({ ...addAccountData, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Contraseña"
                type="password"
                fullWidth
                value={addAccountData.password}
                onChange={(e) => setAddAccountData({ ...addAccountData, password: e.target.value })}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={handleCloseUserManagementPopup} sx={{ mr: 1 }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddAccountSubmit} 
                  variant="contained" 
                  color="primary"
                >
                  Crear Cuenta
                </Button>
              </Box>
            </Box>
          )}
          
          {userManagementTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Eliminar Cuenta Existente</Typography>
              {users.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                  No hay usuarios registrados
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Acción</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.email}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell align="center">
                            <Button 
                              variant="outlined" 
                              color="error"
                              onClick={() => handleOpenDeleteUserDialog(user)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openChangePasswordPopup} onClose={handleCloseChangePasswordPopup}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white'
        }}>
          Cambiar Contraseña
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            margin="dense"
            label="Nueva Contraseña"
            type="password"
            fullWidth
            value={passwordData.password}
            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Repetir Contraseña"
            type="password"
            fullWidth
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseChangePasswordPopup}>
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePasswordSubmit} 
            variant="contained" 
            color="primary"
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteUserDialog} onClose={handleCloseDeleteUserDialog}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
          color: 'white'
        }}>
          ⚠️ Confirmar Eliminación
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas eliminar al usuario?
          </Typography>
          {userToDelete && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Nombre: {userToDelete.name}
              </Typography>
              <Typography variant="body2">
                Email: {userToDelete.email}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteUserDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteUserSubmit} 
            variant="contained" 
            color="error"
          >
            Eliminar Usuario
          </Button>
        </DialogActions>
      </Dialog>

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

      <Dialog open={openAddDomainPopup} onClose={handleCloseAddDomainPopup}>
        <DialogTitle>Agregar Dominios</DialogTitle>
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
          <Button onClick={handleAddDomainSubmit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Dashboard;