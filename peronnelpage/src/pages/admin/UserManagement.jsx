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
  Snackbar,
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
import apiClient from '../../services/apiService';

const UserManagement = () => {
  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
    isActive: true
  });

  // User roles
  const userRoles = [
    { value: 'ROLE_ADMIN', label: 'Admin', color: '#ef4444', icon: <AdminIcon /> },
    { value: 'ROLE_STAFF', label: 'Staff', color: '#10b981', icon: <TeacherIcon /> },
    { value: 'ROLE_STUDENT', label: 'Student', color: '#3b82f6', icon: <StudentIcon /> }
  ];

  // Mock data for development
  const mockUsers = [
    {
      id: 1,
      fullName: 'John Doe',
      email: 'john.admin@codelearn.com',
      phone: '0123456789',
      role: 'ROLE_ADMIN',
      isActive: true,
      createdAt: '2024-01-15',
      lastLogin: '2024-01-20'
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane.staff@codelearn.com',
      phone: '0987654321',
      role: 'ROLE_STAFF',
      isActive: true,
      createdAt: '2024-01-10',
      lastLogin: '2024-01-19'
    },
    {
      id: 3,
      fullName: 'Mike Johnson',
      email: 'mike.student@gmail.com',
      phone: '0555666777',
      role: 'ROLE_STUDENT',
      isActive: true,
      createdAt: '2024-01-08',
      lastLogin: '2024-01-18'
    },
    {
      id: 4,
      fullName: 'Sarah Wilson',
      email: 'sarah.student@gmail.com',
      phone: '0444555666',
      role: 'ROLE_STUDENT',
      isActive: false,
      createdAt: '2024-01-05',
      lastLogin: '2024-01-15'
    }
  ];

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Không thể tải danh sách người dùng', 'error');
      // Use mock data for development
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        password: '',
        confirmPassword: '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        confirmPassword: '',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: '',
      password: '',
      confirmPassword: '',
      isActive: true
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.role) {
      showSnackbar('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return false;
    }

    if (!editingUser && (!formData.password || !formData.confirmPassword)) {
      showSnackbar('Vui lòng nhập mật khẩu', 'error');
      return false;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      showSnackbar('Mật khẩu xác nhận không khớp', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showSnackbar('Email không hợp lệ', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive
      };

      if (!editingUser || formData.password) {
        userData.password = formData.password;
      }

      if (editingUser) {
        // Update user
        await apiClient.put(`/users/${editingUser.id}`, userData);
        showSnackbar('Cập nhật người dùng thành công!', 'success');
      } else {
        // Create new user
        await apiClient.post('/users', userData);
        showSnackbar('Tạo người dùng thành công!', 'success');
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar('Có lỗi xảy ra khi lưu người dùng', 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await apiClient.delete(`/users/${userId}`);
        showSnackbar('Xóa người dùng thành công!', 'success');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnackbar('Có lỗi xảy ra khi xóa người dùng', 'error');
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiClient.patch(`/users/${userId}/status`, { isActive: !currentStatus });
      showSnackbar(`${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công!`, 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      showSnackbar('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
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
    return userRoles.find(r => r.value === role) || { label: role, color: '#6b7280', icon: <PersonIcon /> };
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

      {/* Search and Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
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
            <FormControl fullWidth>
              <InputLabel>Lọc theo vai trò</InputLabel>
              <Select
                value={roleFilter}
                label="Lọc theo vai trò"
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tất cả vai trò</MenuItem>
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {role.icon}
                      {role.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" gap={2}>
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
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Vai Trò</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Liên Hệ</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Trạng Thái</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Ngày Tạo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user, index) => {
              const roleInfo = getRoleInfo(user.role);
              return (
                <TableRow
                  key={user.id}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f8fafc',
                      transform: 'scale(1.001)',
                      transition: 'all 0.2s ease'
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
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      size="small"
                      color={user.isActive ? 'success' : 'error'}
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Chỉnh sửa người dùng">
                        <IconButton
                          onClick={() => handleOpenDialog(user)}
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
                          onClick={() => handleDelete(user.id)}
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
          gap: 2,
          py: 3
        }}>
          <PersonIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="div">
            {editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#1e293b', fontWeight: 600 }}>
              {editingUser ? 'Cập nhật thông tin người dùng' : 'Thông tin người dùng mới'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điền đầy đủ thông tin để {editingUser ? 'cập nhật' : 'tạo'} tài khoản người dùng
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Full Name */}
            <Grid item xs={12}>
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
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              />
            </Grid>

            {/* Email and Role */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                variant="outlined"
                placeholder="user@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Vai Trò"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              >
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {role.icon}
                      <Typography>{role.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số Điện Thoại"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                variant="outlined"
                placeholder="0123456789"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Trạng Thái"
                value={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              >
                <MenuItem value={true}>
                  <Chip label="Hoạt động" color="success" size="small" />
                </MenuItem>
                <MenuItem value={false}>
                  <Chip label="Vô hiệu hóa" color="error" size="small" />
                </MenuItem>
              </TextField>
            </Grid>

            {/* Password fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label={editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required={!editingUser}
                variant="outlined"
                placeholder="Nhập mật khẩu..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required={!editingUser || formData.password}
                variant="outlined"
                placeholder="Nhập lại mật khẩu..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            p: 4,
            bgcolor: '#f8f9fa',
            gap: 2,
            justifyContent: 'space-between',
            borderTop: '1px solid #e0e0e0'
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              * Các trường bắt buộc
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
