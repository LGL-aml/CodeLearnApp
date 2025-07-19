import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Link, 
  Divider, 
  InputAdornment, 
  IconButton,
  Grid,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CodeIcon from '@mui/icons-material/Code';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../services/config';
import { showSuccessAlert, showErrorAlert } from '../common/AlertNotification';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    phone: '',
    birthDate: '',
    terms: false
  });
  
  // Add state to track validation errors
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    phone: '',
    birthDate: '',
    terms: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    document.title = "Đăng Ký - CodeLearn";
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
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
    
    // Validate email
    if (!formData.email) {
      tempErrors.email = 'Vui lòng nhập địa chỉ email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Địa chỉ email không hợp lệ';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      tempErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }
    
    // Validate fullname
    if (!formData.fullname.trim()) {
      tempErrors.fullname = 'Vui lòng nhập họ và tên';
      isValid = false;
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    }
    
    // Validate terms
    if (!formData.terms) {
      tempErrors.terms = 'Vui lòng đồng ý với điều khoản sử dụng';
      isValid = false;
    }
    
    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Set processing state to true
    setProcessing(true);
    
    try {
      // Format birthDate for the API if needed
      let yob = '';
      if (formData.birthDate) {
        const date = new Date(formData.birthDate);
        yob = date.getFullYear().toString();
      }
      
      // Prepare payload according to API requirements
      const payload = {
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullname: formData.fullname, 
        email: formData.email,
        phone: formData.phone,
        yob: yob
      };
      
      console.log('Sending registration request:', payload);
      
      const response = await axios.post(
        `${API_URL}/auth/register`,
        payload
      );
      
      // Set processing state to false
      setProcessing(false);
      
      if (response.status === 200 || response.status === 201) {
        showSuccessAlert('Đăng ký thành công!');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      // Set processing state to false on error
      setProcessing(false);
      
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error ||
                         'Đã có lỗi xảy ra khi đăng ký!';
                          
      showErrorAlert(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box sx={{
      padding: '60px 0',
      backgroundColor: 'var(--bg-primary)',
      backgroundImage:
        'radial-gradient(circle at 25% 25%, rgba(88, 166, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(31, 111, 235, 0.1) 0%, transparent 50%)',
      minHeight: 'calc(100vh - 300px)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Card sx={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 5px 20px var(--shadow-primary)',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'var(--bg-secondary)'
      }}>
        {/* Left side - Register Form */}
        <Box sx={{
          flex: 1,
          padding: '40px',
          bgcolor: 'var(--bg-secondary)'
        }}>
          <Box sx={{ textAlign: 'center', marginBottom: '30px' }}>
            <Typography variant="h4" component="h1" sx={{ marginBottom: '10px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Đăng ký tài khoản
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
              Tham gia cùng CodeLearn để tiếp cận các khóa học lập trình miễn phí
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '500px', margin: '0 auto' }}>
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
                    '& fieldset': { borderColor: 'var(--border-primary)' },
                    '&:hover fieldset': { borderColor: 'var(--accent-primary)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
                    '& input': { color: 'var(--text-primary)' },
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
                  }
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
                Email <span style={{ color: 'var(--accent-error)' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="email"
                name="email"
                placeholder="Nhập địa chỉ email của bạn"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'var(--text-muted)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'var(--border-primary)' },
                    '&:hover fieldset': { borderColor: 'var(--accent-primary)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
                    '& input': { color: 'var(--text-primary)' },
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
                  }
                }}
              />
              {errors.email && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block' }}>
                  {errors.email}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Mật khẩu <span style={{ color: 'var(--accent-error)' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="password"
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
                    '& fieldset': { borderColor: 'var(--border-primary)' },
                    '&:hover fieldset': { borderColor: 'var(--accent-primary)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
                    '& input': { color: 'var(--text-primary)' },
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
                  }
                }}
              />
              {errors.password && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block' }}>
                  {errors.password}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Nhập lại mật khẩu <span style={{ color: 'var(--accent-error)' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu của bạn"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'var(--text-muted)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        sx={{ color: 'var(--text-muted)' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'var(--border-primary)' },
                    '&:hover fieldset': { borderColor: 'var(--accent-primary)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
                    '& input': { color: 'var(--text-primary)' },
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
                  }
                }}
              />
              {errors.confirmPassword && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block' }}>
                  {errors.confirmPassword}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Họ và Tên <span style={{ color: 'var(--accent-error)' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="fullname"
                placeholder="Nhập họ và tên của bạn"
                value={formData.fullname}
                onChange={handleChange}
                error={!!errors.fullname}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'var(--text-muted)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'var(--border-primary)' },
                    '&:hover fieldset': { borderColor: 'var(--accent-primary)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
                    '& input': { color: 'var(--text-primary)' },
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
                  }
                }}
              />
              {errors.fullname && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block' }}>
                  {errors.fullname}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Số điện thoại <span style={{ color: 'var(--accent-error)' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="phone"
                placeholder="Nhập số điện thoại của bạn"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'var(--text-muted)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'var(--border-primary)' },
                    '&:hover fieldset': { borderColor: 'var(--accent-primary)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
                    '& input': { color: 'var(--text-primary)' },
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
                  }
                }}
              />
              {errors.phone && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block' }}>
                  {errors.phone}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: '25px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Ngày sinh
              </Typography>
              <TextField
                type="date"
                fullWidth
                name="birthDate"
                value={formData.birthDate || ''}
                onChange={handleChange}
                error={!!errors.birthDate}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: 'var(--text-muted)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'var(--border-primary)' },
                    '&:hover fieldset': { borderColor: 'var(--accent-primary)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
                    '& input': { color: 'var(--text-primary)' },
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
                  }
                }}
              />
              {errors.birthDate && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block' }}>
                  {errors.birthDate}
                </Typography>
              )}
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    sx={{
                      color: 'var(--accent-primary)',
                      '&.Mui-checked': { color: 'var(--accent-primary)' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Tôi đồng ý với <Link href="#" sx={{ color: 'var(--accent-primary)' }}>Điều khoản sử dụng</Link> và <Link href="#" sx={{ color: 'var(--accent-primary)' }}>Chính sách bảo mật</Link> <span style={{ color: 'var(--accent-error)' }}>*</span>
                  </Typography>
                }
              />
              {errors.terms && (
                <Typography variant="caption" sx={{ color: 'var(--accent-error)', mt: 1, display: 'block', pl: 4 }}>
                  {errors.terms}
                </Typography>
              )}
            </Box>

            <Button 
              fullWidth 
              variant="contained"
              type="submit"
              disabled={processing}
              sx={{
                padding: '12px',
                backgroundColor: 'var(--accent-primary)',
                '&:hover': {
                  backgroundColor: 'var(--accent-secondary)',
                },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                position: 'relative'
              }}
            >
              {processing ? (
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
                  <span style={{ visibility: 'hidden' }}>Đăng ký</span>
                </>
              ) : 'Đăng ký'}
            </Button>

            <Box sx={{ 
              textAlign: 'center', 
              position: 'relative',
              margin: '25px 0',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: 0,
                width: 'calc(50% - 70px)',
                height: '1px',
                backgroundColor: 'var(--border-primary)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                right: 0,
                width: 'calc(50% - 70px)',
                height: '1px',
                backgroundColor: 'var(--border-primary)'
              }
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'inline-block',
                  padding: '0 15px',
                  backgroundColor: 'var(--bg-secondary)',
                  position: 'relative',
                  color: 'var(--text-muted)'
                }}
              >
                Hoặc đăng ký bằng
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', width: '100%' }}>
              <Button
                variant="outlined"
                startIcon={<CodeIcon />}
                sx={{
                  width: '100%',
                  padding: '10px',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--accent-primary)',
                  '&:hover': {
                    backgroundColor: 'rgba(88, 166, 255, 0.1)',
                    borderColor: 'var(--accent-primary)'
                  },
                  textTransform: 'none'
                }}
              >
                GitHub
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                Đã có tài khoản? {' '}
                <Button 
                  component={RouterLink} 
                  to="/login"
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
                  Đăng nhập ngay
                </Button>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right side - Image */}
        <Box 
          sx={{
            flex: 1,
            position: 'relative',
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Box 
            component="img"
            src="https://techcrunch.com/wp-content/uploads/2015/04/codecode.jpg?w=1024"
            alt="Lập trình"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '40px'
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white', 
                fontWeight: 700, 
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              Học lập trình cùng chuyên gia
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'white', 
                textAlign: 'center',
                lineHeight: 1.6
              }}
            >
              Đăng ký tài khoản để tiếp cận các khóa học, tài liệu và kỹ năng lập trình hiện đại
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Register; 