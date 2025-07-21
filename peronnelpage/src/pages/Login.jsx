import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Computer as ComputerIcon
} from '@mui/icons-material';
import { getAccessToken, setUserInfo, checkAndRefreshToken } from '../utils/auth';
import apiClient from '../services/apiService';
import { API_URL } from '../services/config';

const Login = ({ updateUserInfo }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Kiểm tra đăng nhập khi load trang
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const response = await apiClient.post('/auth/me', {
            accessToken: token
          });
          
          // Lưu thông tin người dùng
          setUserInfo(response.data);
          // Cập nhật state userInfo ở App component
          if (updateUserInfo) updateUserInfo();
          
          // Nếu token hợp lệ, chuyển hướng người dùng theo role
          handleRoleNavigation(response.data.role);
        } catch (err) {
          if (err.response && err.response.status === 401) {
            // Token hết hạn, thử refresh
            const refreshSuccess = await checkAndRefreshToken();
            if (refreshSuccess) {
              // Nếu refresh thành công, lấy lại thông tin người dùng
              try {
                const userResponse = await apiClient.post('/auth/me', {
                  accessToken: getAccessToken()
                });
                setUserInfo(userResponse.data);
                // Cập nhật state userInfo ở App component
                if (updateUserInfo) updateUserInfo();
                handleRoleNavigation(userResponse.data.role);
              } catch (error) {
                console.error('Error fetching user info after token refresh:', error);
              }
            }
          }
        }
      }
    };
    
    checkAuth();
  }, [navigate, updateUserInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Kiểm tra thông tin đăng nhập
    if (!formData.username || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin!');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/login', {
        username: formData.username,
        password: formData.password
      });

      // Lưu token vào local storage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      setSuccess('Đăng nhập thành công!');
      
      // Gọi API lấy thông tin người dùng
      try {
        const userResponse = await apiClient.post('/auth/me', {
          accessToken: response.data.accessToken
        });
        
        // Lưu thông tin người dùng
        setUserInfo(userResponse.data);
        // Cập nhật state userInfo ở App component
        if (updateUserInfo) updateUserInfo();
        
        // Xử lý điều hướng dựa trên role
        setTimeout(() => {
          handleRoleNavigation(userResponse.data.role);
        }, 1000);
        
      } catch (err) {
        setError('Không thể lấy thông tin người dùng');
        console.error('User info error:', err);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401) {
          setError(err.response.data.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
        } else {
          setError('Có lỗi xảy ra. Vui lòng thử lại!');
        }
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý điều hướng dựa trên role
  const handleRoleNavigation = (role) => {
    if (!role) {
      setError('Không tìm thấy thông tin vai trò trong tài khoản!');
      return;
    }
    
    // Xử lý các chuỗi vai trò có định dạng ROLE_XXX
    if (role.includes('ROLE_ADMIN') || role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role.includes('ROLE_MANAGER') || role === 'manager') {
      navigate('/manager/dashboard');
    } else if (role.includes('ROLE_CONSULTANT') || role === 'consultant') {
      navigate('/consultant/dashboard');
    } else if (role.includes('ROLE_STAFF') || role === 'staff') {
      navigate('/staff/dashboard');
    } else if (role.includes('ROLE_MEMBER')) {
      // Không cho phép member đăng nhập vào hệ thống
      setError('Bạn không có quyền truy cập vào hệ thống này!');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    } else {
      setError('Bạn không có quyền truy cập vào hệ thống này!');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d1117',
        backgroundImage:
          'radial-gradient(circle at 25% 25%, rgba(88, 166, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(31, 111, 235, 0.1) 0%, transparent 50%)',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          right: '-10%',
          bottom: '-10%',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2358a6ff\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          backgroundSize: '15px 15px',
          opacity: 0.5,
          zIndex: 0,
          animation: 'animatedBackground 30s linear infinite',
        },
        '@keyframes animatedBackground': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-100%)' }
        }
      }}
    >
      <Card sx={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
        bgcolor: '#161b22'
      }}>
        {/* Left side - Login Form */}
        <Box sx={{
          flex: 1,
          padding: '40px',
          bgcolor: '#161b22'
        }}>
          <Box sx={{ textAlign: 'center', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <ComputerIcon sx={{ mr: 1, fontSize: 32, color: '#3b82f6' }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'white' }}>
                CodeLearn Pro
              </Typography>
            </Box>
            <Typography variant="h4" component="h1" sx={{ marginBottom: '10px', color: '#58a6ff', fontWeight: 600 }}>
              Đăng nhập
            </Typography>
            <Typography variant="body1" sx={{ color: '#8b949e' }}>
              Hệ thống quản lý khóa học và người dùng
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '400px', margin: '0 auto' }}>
            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#f0f6fc' }}>
                Tên đăng nhập <span style={{ color: '#f85149' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="username"
                placeholder="Nhập username của bạn"
                value={formData.username}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#6e7681' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#30363d',
                    },
                    '&:hover fieldset': {
                      borderColor: '#58a6ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#58a6ff',
                    },
                    '& input': {
                      padding: '12px 15px 12px 15px',
                      color: '#f0f6fc'
                    },
                    bgcolor: '#21262d',
                  }
                }}
              />
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#f0f6fc' }}>
                Mật khẩu <span style={{ color: '#f85149' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu của bạn"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#6e7681' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#6e7681' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#30363d',
                    },
                    '&:hover fieldset': {
                      borderColor: '#58a6ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#58a6ff',
                    },
                    '& input': {
                      padding: '12px 15px 12px 15px',
                      color: '#f0f6fc'
                    },
                    bgcolor: '#21262d',
                  }
                }}
              />
            </Box>

            <Button 
              fullWidth 
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                padding: '12px',
                backgroundColor: '#1f6feb',
                '&:hover': {
                  backgroundColor: '#58a6ff',
                },
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                position: 'relative',
                borderRadius: '8px'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      color: 'white',
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-12px'
                    }} 
                  />
                  <span style={{ visibility: 'hidden' }}>Đăng nhập</span>
                </>
              ) : 'Đăng nhập'}
            </Button>


          </Box>
        </Box>

        {/* Right side - Image with overlay text */}
        <Box sx={{
          flex: 1,
          position: 'relative',
          display: { xs: 'none', md: 'block' }
        }}>
          <Box
            component="img"
            src="https://techcrunch.com/wp-content/uploads/2015/04/codecode.jpg?w=1024"
            alt="Lập trình"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'50\' font-size=\'20\' fill=\'%23ffffff\' opacity=\'0.03\'%3E%7B%22code%22%3A %22awesome%22%7D%3C/text%3E%3C/svg%3E")',
              animation: 'float 20s ease-in-out infinite',
              zIndex: -1
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
            }
          }}>
            <Typography variant="h1" component="h1" sx={{ 
              color: 'white', 
              marginBottom: '20px',
              fontWeight: 600,
              fontSize: '3.5rem',
              textAlign: 'center',
              width: '100%',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              animation: 'fadeIn 1.5s ease-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              }
            }}>
              Quản lý hệ thống
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'white',
              fontSize: '1.2rem',
              textAlign: 'center',
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              textShadow: '0 2px 5px rgba(0,0,0,0.5)',
              animation: 'fadeIn 1.5s ease-out 0.3s both',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              }
            }}>
              Đăng nhập để truy cập vào hệ thống quản lý khóa học, người dùng và nội dung
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Login; 