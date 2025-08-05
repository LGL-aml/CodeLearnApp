import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  InputAdornment, 
  IconButton,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CodeIcon from '@mui/icons-material/Code';
import { Link as RouterLink } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../common/AlertNotification';
import styles from './Login.module.css';
import { login } from '../../services/authService';
import { submitSurveyResult } from '../../services/surveyService';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get alert message from location state
  const authAlert = location.state?.showAuthAlert;
  const authMessage = location.state?.authMessage;
  const returnUrl = location.state?.returnUrl;
  const sessionExpired = location.state?.sessionExpired;

  useEffect(() => {
    document.title = "Đăng Nhập - CodeLearn";
    
    // If there's an alert message, display it in the top right corner via AlertNotification component
    if (authAlert && authMessage) {
      showErrorAlert(authMessage);
    }
    
    // Hiển thị thông báo phiên hết hạn nếu được chuyển hướng từ sự kiện session-expired
    if (sessionExpired) {
      showErrorAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    // Lắng nghe sự kiện phiên hết hạn
    const handleSessionExpired = (event) => {
      // Không hiển thị thông báo ở đây vì đã được xử lý trong authService.js
      console.log('Login page received session expired event');
    };
    
    document.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      document.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [authAlert, authMessage, sessionExpired]);

  // Hàm xử lý gửi dữ liệu khảo sát đã lưu
  const handlePendingSurveySubmission = async () => {
    try {
      // Kiểm tra xem có dữ liệu khảo sát đang chờ không
      const storedData = localStorage.getItem('pendingSurveySubmission');
      if (!storedData) return false;
      
      // Parse dữ liệu đã lưu
      const surveyData = JSON.parse(storedData);
      
      // Lấy thông tin cần thiết
      const { surveyId, selectedOptionIds } = surveyData;
      
      if (!surveyId || !selectedOptionIds) {
        throw new Error('Dữ liệu khảo sát không đầy đủ');
      }
      
      // Gửi kết quả khảo sát đến server
      await submitSurveyResult(surveyId, selectedOptionIds);
      
      // Xóa dữ liệu đã lưu sau khi gửi thành công
      localStorage.removeItem('pendingSurveySubmission');
      
      // Lưu thông báo thành công vào localStorage để hiển thị ở trang SurveysList
      localStorage.setItem('surveySubmissionResult', JSON.stringify({
        success: true,
        message: 'Lưu khảo sát thành công'
      }));
      
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu khảo sát:', error);
      
      // Lưu thông báo lỗi vào localStorage để hiển thị ở trang SurveysList
      localStorage.setItem('surveySubmissionResult', JSON.stringify({
        success: false,
        message: 'Có lỗi xảy ra khi lưu khảo sát'
      }));
      
      // Xóa dữ liệu đã lưu để tránh gửi lại lần sau
      localStorage.removeItem('pendingSurveySubmission');
      
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Validate username
    if (!formData.username.trim()) {
      tempErrors.username = 'Vui lòng nhập tên đăng nhập';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      tempErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the login function from authService with the required credentials
      const userData = await login({ username: formData.username, password: formData.password });
      console.log('Login successful, userData:', userData);
      
      showSuccessAlert('Đăng nhập thành công!');
      
      // Kiểm tra và gửi kết quả khảo sát đã lưu (nếu có)
      await handlePendingSurveySubmission();
      
      // Check if there's a redirect URL in sessionStorage
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      
      if (redirectAfterLogin) {
        // Clear the redirect URL from sessionStorage
        sessionStorage.removeItem('redirectAfterLogin');
        // Navigate to the saved URL using navigate instead of window.location
        navigate(redirectAfterLogin);
      } 
      // If there's a returnUrl, redirect to that URL after successful login
      else if (returnUrl) {
        navigate(returnUrl);
      } else {
        // If not, redirect to the homepage
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Check if the error is related to network or other technical issues
      if (error.name === 'TypeError' || error.name === 'NetworkError') {
        showErrorAlert('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
      } else {
        // For any other errors, assume it's related to credentials
        showErrorAlert('Username hoặc Mật khẩu sai!');
        // Show error on both fields for credential errors
        setErrors({
          username: 'Thông tin đăng nhập không chính xác',
          password: 'Thông tin đăng nhập không chính xác'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box className={styles.loginSection}>
      <Card sx={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 5px 20px var(--shadow-primary)',
        bgcolor: 'var(--bg-secondary)'
      }}>
        {/* Left side - Login Form */}
        <Box sx={{
          flex: 1,
          padding: '40px',
          bgcolor: 'var(--bg-secondary)'
        }}>
          <Box sx={{ textAlign: 'center', marginBottom: '30px' }}>
            <Typography variant="h4" component="h1" sx={{ marginBottom: '10px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Đăng nhập
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
              Chào mừng bạn đến với CodeLearn - Học Lập Trình Miễn Phí
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '400px', margin: '0 auto' }}>
            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Username <span style={{ color: 'var(--accent-error)' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="username"
                placeholder="Nhập username của bạn"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'var(--text-muted)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-primary)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '& input': {
                      padding: '12px 15px 12px 15px',
                      color: 'var(--text-primary)'
                    },
                    bgcolor: 'var(--bg-tertiary)',
                    // Override autofill styles
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px var(--bg-tertiary) inset',
                      WebkitTextFillColor: 'var(--text-primary)',
                      caretColor: 'var(--text-primary)',
                      borderRadius: 'inherit'
                    },
                    '& input:-webkit-autofill:focus': {
                      WebkitBoxShadow: '0 0 0 1000px var(--bg-tertiary) inset',
                      WebkitTextFillColor: 'var(--text-primary)',
                    }
                  },
                }}
              />
              {errors.username && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block' }}>
                  {errors.username}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Mật khẩu <span style={{ color: 'var(--accent-error)' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu của bạn"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'var(--text-muted)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{ color: 'var(--text-muted)' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-primary)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--accent-primary)',
                    },
                    '& input': {
                      padding: '12px 15px 12px 15px',
                      color: 'var(--text-primary)'
                    },
                    bgcolor: 'var(--bg-tertiary)',
                    // Override autofill styles
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px var(--bg-tertiary) inset',
                      WebkitTextFillColor: 'var(--text-primary)',
                      caretColor: 'var(--text-primary)',
                      borderRadius: 'inherit'
                    },
                    '& input:-webkit-autofill:focus': {
                      WebkitBoxShadow: '0 0 0 1000px var(--bg-tertiary) inset',
                      WebkitTextFillColor: 'var(--text-primary)',
                    }
                  },
                }}
              />
              {errors.password && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block' }}>
                  {errors.password}
                </Typography>
              )}
            </Box>

            <Button 
              fullWidth 
              variant="contained"
              type="submit"
              disabled={isLoading}
              sx={{
                padding: '12px',
                backgroundColor: 'var(--accent-primary)',
                '&:hover': {
                  backgroundColor: 'var(--accent-secondary)',
                },
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                position: 'relative'
              }}
            >
              {isLoading ? (
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

            <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                Chưa có tài khoản? {' '}
                <Button 
                  component={RouterLink} 
                  to="/register"
                  variant="text"
                  sx={{ 
                    color: 'var(--accent-primary)', 
                    fontWeight: 500, 
                    textDecoration: 'none',
                    padding: '0 4px',
                    minWidth: 'auto',
                    '&:hover': { 
                      textDecoration: 'underline',
                      backgroundColor: 'transparent'
                    } 
                  }}
                >
                  Đăng ký ngay
                </Button>
              </Typography>
            </Box>
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
            padding: '0 40px',
            textAlign: 'center',
          }}>
            <Typography variant="h3" component="h2" sx={{ 
              color: 'white', 
              marginBottom: '20px',
              fontWeight: 600,
            }}>
              Học lập trình cùng chuyên gia
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'white',
              fontSize: '1.1rem'
            }}>
              Đăng nhập để truy cập các khóa học và tài liệu chất lượng cao về lập trình
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Login; 