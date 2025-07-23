import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Grid,
  Avatar,
  Tooltip,
  CircularProgress,
  InputAdornment,
  TablePagination,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
  School as TeacherIcon,
  Code as StudentIcon
} from '@mui/icons-material';
import apiClient, { apiService } from '../../services/apiService';
import notificationService from '../../services/NotificationService.jsx';

const UserManagement = () => {
  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    yob: '',
    address: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  // User roles
  const userRoles = [
    { value: 'ROLE_ADMIN', label: 'Admin', color: '#ef4444', icon: <AdminIcon />, iconComponent: AdminIcon },
    { value: 'ROLE_LECTURER', label: 'Lecturer', color: '#10b981', icon: <TeacherIcon />, iconComponent: TeacherIcon },
    { value: 'ROLE_MEMBER', label: 'Member', color: '#3b82f6', icon: <StudentIcon />, iconComponent: StudentIcon }
  ];

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users from API
      try {
        const response = await apiService.getUsers();
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          notificationService.error('Không thể tải danh sách người dùng: Định dạng dữ liệu không đúng');
          setUsers([]);
        }
      } catch (apiError) {
        console.error('Error fetching users from API:', apiError);
        
        // Extract and show error message from API response if available
        if (apiError.response && apiError.response.data) {
          const errorData = apiError.response.data;
          const errorMessage = errorData.message || 'Không thể tải danh sách người dùng';
          notificationService.error(errorMessage);
        } else {
          notificationService.error('Không thể tải danh sách người dùng');
        }
        
        setUsers([]);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      notificationService.error('Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        yob: user.yob || '',
        address: user.address || '',
        role: user.role || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        yob: '',
        address: '',
        role: '',
        password: '',
        confirmPassword: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      gender: '',
      yob: '',
      address: '',
      role: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.fullName || !formData.email || !formData.role) {
      notificationService.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return false;
    }

    // Kiểm tra username: phải có ít nhất 1 chữ cái và 1 số, không chứa khoảng trắng hoặc ký tự đặc biệt
    const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
    if (!usernameRegex.test(formData.username)) {
      notificationService.error('Username phải có ít nhất 1 chữ cái và 1 số, không chứa khoảng trắng hoặc ký tự đặc biệt');
      return false;
    }

    if (!editingUser && (!formData.password || !formData.confirmPassword)) {
      notificationService.error('Vui lòng nhập mật khẩu');
      return false;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      notificationService.error('Mật khẩu xác nhận không khớp');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notificationService.error('Email không hợp lệ');
      return false;
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      notificationService.error('Số điện thoại không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Create FormData object for multipart/form-data
      const formDataObj = new FormData();
      formDataObj.append('username', formData.username);
      formDataObj.append('fullname', formData.fullName);
      formDataObj.append('email', formData.email);
      formDataObj.append('role', formData.role.replace('ROLE_', '')); // Remove ROLE_ prefix
      
      // Add optional fields
      if (formData.phone) {
        formDataObj.append('phone', formData.phone);
      }
      
      if (formData.gender) {
        formDataObj.append('gender', formData.gender);
      }
      
      if (formData.yob) {
        formDataObj.append('yob', formData.yob);
      }
      
      if (formData.address) {
        formDataObj.append('address', formData.address);
      }
      
      // Add password fields if creating new user or updating password
      if (!editingUser || formData.password) {
        formDataObj.append('password', formData.password);
        formDataObj.append('confirmPassword', formData.confirmPassword);
      }

      if (editingUser) {
        // Update user
        await apiService.updateUser(editingUser.id, formDataObj);
        notificationService.success('Cập nhật người dùng thành công!');
        handleCloseDialog();
        fetchUsers();
      } else {
        // Create new user
        await apiService.createUser(formDataObj);
        notificationService.success('Tạo người dùng thành công!');
        handleCloseDialog();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Extract and show error message from API response if available
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Có lỗi xảy ra khi lưu người dùng';
        notificationService.error(errorMessage);
      } else {
        notificationService.error('Có lỗi xảy ra khi lưu người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        setLoading(true);
        await apiService.deleteUser(userId);
        notificationService.success('Xóa người dùng thành công!');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        
        // Extract and show error message from API response if available
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          const errorMessage = errorData.message || 'Có lỗi xảy ra khi xóa người dùng';
          notificationService.error(errorMessage);
        } else {
          notificationService.error('Có lỗi xảy ra khi xóa người dùng');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Status toggle function removed as per request

  // Filter users based on search term only
  const filteredUsers = users.filter(user => {
    return user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.phone && user.phone.includes(searchTerm));
  });

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleInfo = (role) => {
    return userRoles.find(r => r.value === role) || { label: role, color: '#6b7280', icon: <PersonIcon />, iconComponent: PersonIcon };
  };

  // Common styles for form fields
  const inputFieldStyle = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      height: 56
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 16px) scale(1)'
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)'
    },
    '& .MuiInputBase-input': {
      padding: '16px 14px 16px 0'
    },
    '& .MuiInputAdornment-root': {
      minWidth: 40,
      display: 'flex',
      justifyContent: 'center'
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Quản Lý Người Dùng
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Quản lý tài khoản Admin, Staff và Student trong hệ thống
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
            sx={{ 
              bgcolor: 'white',
              color: '#1e293b',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: '#f5f5f5',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Thêm Người Dùng
          </Button>
        </Box>
      </Paper>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#f8f9fa'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end">
              <Typography variant="body2" color="text.secondary">
                Tổng cộng: <strong>{filteredUsers.length}</strong> người dùng
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Người Dùng</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Vai Trò</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Liên Hệ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user, index) => {
              const roleInfo = getRoleInfo(user.role);
              return (
                <TableRow
                  key={user.id}
                  onClick={() => handleOpenDialog(user)}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f8fafc',
                      transform: 'scale(1.001)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    },
                    '&:nth-of-type(even)': {
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor: roleInfo.color,
                          width: 48,
                          height: 48,
                          boxShadow: `0 2px 8px ${roleInfo.color}30`
                        }}
                      >
                        {roleInfo.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {user.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={roleInfo.label}
                      icon={roleInfo.icon}
                      size="small"
                      sx={{
                        bgcolor: `${roleInfo.color}20`,
                        color: roleInfo.color,
                        fontWeight: 500,
                        border: `1px solid ${roleInfo.color}40`
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <EmailIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                      {user.phone && (
                        <Box display="flex" alignItems="center">
                          <PhoneIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                          <Typography variant="body2">{user.phone}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Xem/Chỉnh sửa người dùng">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(user);
                          }}
                          sx={{
                            color: '#3b82f6',
                            '&:hover': {
                              bgcolor: 'rgba(59, 130, 246, 0.1)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa người dùng">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user.id);
                          }}
                          sx={{
                            color: '#ef4444',
                            '&:hover': {
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </TableContainer>

      {/* Create/Edit User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: '#1e293b',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 3
        }}>
          <PersonIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="div">
            {editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
          <Box sx={{ 
            mb: 4, 
            p: 3, 
            bgcolor: '#f8f9fa', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            textAlign: 'center',
            width: '100%',
            maxWidth: '500px',
            mx: 'auto'
          }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#1e293b', fontWeight: 600 }}>
              {editingUser ? 'Cập nhật thông tin người dùng' : 'Thông tin người dùng mới'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điền đầy đủ thông tin để {editingUser ? 'cập nhật' : 'tạo'} tài khoản người dùng
            </Typography>
          </Box>

          <Box sx={{ width: '100%', maxWidth: '500px', mx: 'auto' }}>
            {/* Thông tin cơ bản */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                variant="outlined"
                placeholder="Nhập username..."
                error={formData.username && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(formData.username)}
                helperText={formData.username && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(formData.username) 
                  ? "Username phải có ít nhất 1 chữ cái và 1 số, không chứa khoảng trắng hoặc ký tự đặc biệt" 
                  : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputFieldStyle}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Họ và Tên"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                variant="outlined"
                placeholder="Nhập họ và tên..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputFieldStyle}
              />
            </Box>

            {/* Email */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                variant="outlined"
                placeholder="user@example.com"
                error={formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                helperText={formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "Email không hợp lệ" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputFieldStyle}
              />
            </Box>

            {/* Phone */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Số Điện Thoại"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                variant="outlined"
                placeholder="0123456789"
                error={formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)}
                helperText={formData.phone && !/^[0-9]{10,11}$/.test(formData.phone) ? "Số điện thoại không hợp lệ" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputFieldStyle}
              />
            </Box>
            
            {/* Role */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                select
                label="Vai Trò"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                required
                variant="outlined"
                sx={{
                  ...inputFieldStyle,
                  '& .MuiSelect-select': {
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
                                  InputProps={{
                  startAdornment: formData.role ? (
                    <InputAdornment position="start" sx={{ minWidth: 28 }}>
                      {(() => {
                        const RoleIcon = getRoleInfo(formData.role).iconComponent;
                        return <RoleIcon color="primary" sx={{ fontSize: 20 }} />;
                      })()}
                    </InputAdornment>
                  ) : null,
                }}
              >
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Typography>{role.label}</Typography>
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Gender */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                select
                label="Giới Tính"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                variant="outlined"
                sx={{
                  ...inputFieldStyle,
                  '& .MuiSelect-select': {
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
                InputProps={{
                  startAdornment: formData.gender ? (
                    <InputAdornment position="start" sx={{ minWidth: 28 }}>
                      <PersonIcon color="primary" sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ) : null,
                }}
              >
                <MenuItem value="MALE">Nam</MenuItem>
                <MenuItem value="FEMALE">Nữ</MenuItem>
                <MenuItem value="OTHER">Khác</MenuItem>
              </TextField>
            </Box>

            {/* Year of Birth */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Năm Sinh"
                type="number"
                value={formData.yob}
                onChange={(e) => handleInputChange('yob', e.target.value)}
                variant="outlined"
                placeholder="1990"
                sx={inputFieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body1" color="primary" sx={{ fontSize: 20, width: 20, textAlign: 'center' }}>
                        #
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Address */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Địa Chỉ"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                variant="outlined"
                placeholder="Nhập địa chỉ..."
                sx={inputFieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ fontSize: 20, width: 20, textAlign: 'center' }}>
                        🏠
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Password fields */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="password"
                label={editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required={!editingUser}
                variant="outlined"
                placeholder="Nhập mật khẩu..."
                sx={inputFieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ fontSize: 20, width: 20, textAlign: 'center' }}>
                        🔒
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="password"
                label={!editingUser || formData.password ? "Xác nhận mật khẩu" : "Xác nhận mật khẩu"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required={!editingUser || formData.password}
                variant="outlined"
                placeholder="Nhập lại mật khẩu..."
                error={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword ? "Mật khẩu không khớp" : ""}
                sx={inputFieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ fontSize: 20, width: 20, textAlign: 'center' }}>
                        🔐
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 4,
            bgcolor: '#f8f9fa',
            gap: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderTop: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ width: '100%', textAlign: 'center', mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              * Các trường bắt buộc
            </Typography>
          </Box>

          <Box display="flex" gap={3} justifyContent="center">
            <Button
              onClick={handleCloseDialog}
              startIcon={<CancelIcon />}
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                borderColor: '#ef4444',
                color: '#ef4444',
                fontWeight: 600,
                minWidth: 140,
                '&:hover': {
                  borderColor: '#ef4444',
                  bgcolor: 'rgba(239, 68, 68, 0.04)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Hủy Bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<SaveIcon />}
              size="large"
              sx={{
                bgcolor: '#1e293b',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                minWidth: 180,
                boxShadow: '0 4px 12px rgba(30, 41, 59, 0.3)',
                '&:hover': {
                  bgcolor: '#334155',
                  boxShadow: '0 6px 16px rgba(30, 41, 59, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {editingUser ? 'Cập Nhật' : 'Tạo Người Dùng'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications - updated for better error display */}
      {/* The Snackbar component is removed as per the edit hint. */}
    </Box>
  );
};

export default UserManagement;
