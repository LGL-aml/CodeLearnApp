import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Paper, Divider, 
         List, ListItem, ListItemIcon, ListItemText, Avatar, Chip, styled, Alert, Snackbar, CircularProgress, LinearProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideocamIcon from '@mui/icons-material/Videocam';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { isAuthenticated, getUserData } from '../../services/authService';
import axios from 'axios';
import { API_URL } from '../../services/config';

// Styled components to match the dark theme
const CourseDetailWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(5),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  }
}));

const CourseInfoSection = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: '300px',
  color: 'var(--text-primary)'
}));

const CourseSidebar = styled(Box)(({ theme }) => ({
  width: '350px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
  },
}));

const CoursePreview = styled(Paper)(({ theme }) => ({
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 5px 20px var(--shadow-primary)',
  position: 'sticky',
  top: '20px',
}));

const CourseFeatures = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
}));

const FeatureItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  color: 'var(--text-primary)',
  paddingLeft: 0,
  paddingRight: 0,
}));

const EnrollButton = styled(Button)(({ theme, status }) => ({
  width: '100%',
  padding: '15px',
  backgroundColor: 'var(--accent-primary)',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginTop: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'var(--accent-secondary)',
  },
}));

const CertificateButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '15px',
  backgroundColor: 'var(--accent-success)',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginTop: theme.spacing(1),
  '&:hover': {
    backgroundColor: '#219653',
  },
}));

const ModuleAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  borderRadius: '4px',
  marginBottom: '8px',
  boxShadow: '0 2px 5px var(--shadow-primary)',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    padding: '8px 16px',
  },
  '& .MuiAccordionDetails-root': {
    padding: '8px 16px 16px',
    borderTop: `1px solid var(--border-primary)`,
  },
}));

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedModule, setExpandedModule] = useState(false);

  useEffect(() => {
    // Check if there is state passed through navigation
    if (location.state?.showAlert) {
      setAlertMessage(location.state.alertMessage);
      setAlertSeverity(location.state.alertSeverity || 'error');
      setAlertOpen(true);
      
      // Clear state to avoid showing alert again on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleModuleChange = (moduleId) => (event, isExpanded) => {
    setExpandedModule(isExpanded ? moduleId : false);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // Chuẩn bị headers với accessToken nếu có
        const headers = {};
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        // Use axios to call the new API endpoint with authorization header
        const response = await axios.get(`${API_URL}/public/course/${id}`, { headers });
        
        // Extract data from the nested structure
        if (response.data && response.data.data) {
          setCourse(response.data.data);
          
          // If user is authenticated and course status is IN_PROGRESS or COMPLETED, fetch details
          if (isAuthenticated() && (response.data.data.status === 'IN_PROGRESS' || response.data.data.status === 'COMPLETED')) {
            fetchCourseDetail();
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Không thể tải thông tin khóa học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id]);

  // Hàm lấy thông tin chi tiết khóa học bao gồm tiến độ
  const fetchCourseDetail = async () => {
    try {
      setLoadingDetail(true);
      const response = await axios.get(`${API_URL}/courses/detail/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.data && response.data.data) {
        setCourseDetail(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching course detail:', err);
      // Không hiển thị lỗi đến người dùng vì đây là tính năng bổ sung
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const userData = getUserData();
    if (userData && userData.id) {
      setUserId(userData.id);
    }
  }, []);

  // Check if user is authenticated
  const checkAuthentication = async () => {
    return isAuthenticated();
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Handle enrollment button click
  const handleEnrollClick = async () => {
    if (course.status === 'NOT_ENROLLED') {
      // Check if user is authenticated
      const isUserAuthenticated = await checkAuthentication();
      if (!isUserAuthenticated) {
        // Redirect directly to login page and pass state to display alert
        navigate('/login', { 
          state: { 
            showAuthAlert: true, 
            authMessage: 'Cần đăng nhập để có thể tham gia khóa học!',
            returnUrl: `/courses/${id}` 
          } 
        });
        return;
      }
      
      // Set processing state to true
      setIsProcessing(true);
      
      // Call API to enroll in the course
      try {
        await axios.post(`${API_URL}/courses/${id}/enroll`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        // Show success message
        showAlert('Tham gia khóa học thành công!', 'success');
        
        // Reload the page to refresh course status
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        if (err.response && err.response.status === 400) {
          // Show error message if user already enrolled
          showAlert('Bạn đã tham gia khóa học này!', 'error');
        } else {
          showAlert('Đã có lỗi xảy ra khi tham gia khóa học!', 'error');
        }
        console.error('Enrollment error:', err);
        
        // Set processing state to false on error
        setIsProcessing(false);
      }
    } else {
      // Navigate to course learning page
      navigate(`/courses/${course.id}/learn`);
    }
  };
  
  // Handle certificate button click
  const handleCertificateClick = () => {
    // Lấy userId từ token JWT thông qua hàm getUserData
    const userInfo = getUserData();
    
    if (!userInfo || !userInfo.id) {
      showAlert('Vui lòng đăng nhập để xem chứng chỉ', 'error');
      return;
    }
    
    // Điều hướng đến trang chứng chỉ với courseId và userId
    navigate(`/courses/${id}/cert/${userInfo.id}`);
  };

  // Get button text based on enrollment status
  const getButtonText = () => {
    switch (course?.status) {
      case 'IN_PROGRESS':
        return 'TIẾP TỤC KHÓA HỌC';
      case 'COMPLETED':
        return 'TIẾP TỤC KHÓA HỌC';
      default:
        return 'THAM GIA KHÓA HỌC';
    }
  };

  // Format progress với 2 chữ số thập phân
  const formatProgress = (progress) => {
    if (!progress && progress !== 0) return '0.00';
    return progress.toFixed(2);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress color="primary" />
    </Box>;
  }

  if (error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Typography color="error">{error}</Typography>
    </Box>;
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={3000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ 
          '& .MuiPaper-root': { 
            width: '400px',
            boxShadow: '0 4px 20px var(--shadow-primary)'
          }
        }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          variant="filled"
          sx={{ 
            width: '100%',
            fontSize: '1.1rem',
            fontWeight: 500,
            padding: '16px 20px',
            '& .MuiAlert-icon': {
              fontSize: '24px'
            },
            '& .MuiAlert-message': {
              fontSize: '1.1rem'
            }
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      
      <CourseDetailWrapper>
        {/* Left Side - Course Information */}
        <CourseInfoSection>
          <Chip 
            label={course.topicName} 
            color="primary" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              bgcolor: 'var(--accent-primary)',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          />
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 700, mb: 2.5, color: 'var(--text-primary)', lineHeight: 1.3 }}
          >
            {course.title}
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'var(--accent-primary)', fontWeight: 600, mb: 1.5, paddingBottom: 0.5, paddingTop: 2.5, borderTop: `1px solid var(--border-primary)` }}>
              Nội dung khóa học
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: course.content }} style={{ color: 'var(--text-primary)', lineHeight: 1.7 }} />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'var(--accent-primary)', fontWeight: 600, mb: 1.5, paddingBottom: 0.5, paddingTop: 2.5, borderTop: `1px solid var(--border-primary)` }}>
              Các phần học
            </Typography>
            
            {course.modules && course.modules.map((module) => (
              <ModuleAccordion 
                key={module.id}
                expanded={expandedModule === module.id}
                onChange={handleModuleChange(module.id)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'var(--accent-primary)' }} />}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MenuBookIcon sx={{ mr: 1.5, color: 'var(--accent-primary)' }} />
                    <Typography sx={{ fontWeight: 500 }}>{module.title}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {module.summary ? (
                    <Typography sx={{ color: 'var(--text-secondary)' }}>
                      {module.summary}
                    </Typography>
                  ) : (
                    <Typography sx={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      Không có mô tả chi tiết cho phần học này.
                    </Typography>
                  )}
                </AccordionDetails>
              </ModuleAccordion>
            ))}
          </Box>
          
        </CourseInfoSection>
        
        {/* Right Side - Course Sidebar */}
        <CourseSidebar>
          <CoursePreview elevation={3}>
            <Box sx={{ width: '100%' }}>
              <img 
                src={course.coverImage}
                alt={course.title}
                style={{ 
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }}
              />
            </Box>
            
            <CourseFeatures>
              <FeatureItem disableGutters>
                <AccessTimeIcon sx={{ mr: 1.5, color: 'var(--accent-primary)' }} />
                <Typography>Thời lượng: <strong>{course.duration} giờ</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <VideocamIcon sx={{ mr: 1.5, color: 'var(--accent-primary)' }} />
                <Typography>Bài giảng: <strong>{course.videoCount} video</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <PeopleIcon sx={{ mr: 1.5, color: 'var(--accent-primary)' }} />
                <Typography>Số lượng học viên: <strong>{course.totalEnrolled}</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <PersonIcon sx={{ mr: 1.5, color: 'var(--accent-primary)' }} />
                <Typography>Giảng viên: <strong>{course.createdBy}</strong></Typography>
              </FeatureItem>
              
              {(course.status === 'IN_PROGRESS' || course.status === 'COMPLETED') && courseDetail && (
                <Box sx={{ mt: 1, mb: 1.5 }}>
                  <FeatureItem disableGutters>
                    <TimelineIcon sx={{ mr: 1.5, color: 'var(--accent-primary)' }} />
                    <Typography>
                      Tiến độ: <strong>{course.status === 'COMPLETED' ? '100.00' : formatProgress(courseDetail.progress)}%</strong>
                    </Typography>
                  </FeatureItem>
                  <LinearProgress 
                    variant="determinate" 
                    value={course.status === 'COMPLETED' ? 100 : courseDetail.progress} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      mt: 0.5,
                      mb: 1,
                      backgroundColor: 'var(--bg-tertiary)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: course.status === 'COMPLETED' ? 'var(--accent-success)' : 'var(--accent-success)'
                      }
                    }} 
                  />
                </Box>
              )}
              
              <EnrollButton 
                status={course.status !== 'COMPLETED' ? course.status : 'IN_PROGRESS'}
                onClick={handleEnrollClick}
                disabled={isProcessing && course.status === 'NOT_ENROLLED'}
                sx={{
                  position: 'relative'
                }}
              >
                {isProcessing && course.status === 'NOT_ENROLLED' ? (
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
                    <span style={{ visibility: 'hidden' }}>{getButtonText()}</span>
                  </>
                ) : getButtonText()}
              </EnrollButton>

              {course.status === 'COMPLETED' && (
                <CertificateButton
                  onClick={handleCertificateClick}
                  startIcon={<EmojiEventsIcon />}
                >
                  NHẬN CHỨNG CHỈ
                </CertificateButton>
              )}
            </CourseFeatures>
          </CoursePreview>
        </CourseSidebar>
      </CourseDetailWrapper>
    </Container>
  );
}

export default CourseDetail;