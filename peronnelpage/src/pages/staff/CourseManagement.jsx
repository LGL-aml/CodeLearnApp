import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Card,
  CardContent,
  CardActions,
  Avatar,
  Tooltip,
  Fab,
  CircularProgress,
  InputAdornment,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import apiClient from '../../services/apiService';
import NotificationService from '../../services/NotificationService';

const CourseManagement = () => {
  const navigate = useNavigate();
  // States
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load data on component mount
  useEffect(() => {
    fetchCourses();
    fetchTopics();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use the new API endpoint for fetching lecturer's courses
      const response = await apiClient.get('/courses/my');
      
      if (response.data && Array.isArray(response.data)) {
        setCourses(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Handle the case where data is nested in a data property
        setCourses(response.data.data);
      } else {
        console.error('Unexpected courses data format:', response.data);
        NotificationService.error('Failed to load courses: Unexpected data format');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      NotificationService.error('Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await apiClient.get('/topics');
      setTopics(response.data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditCourse = (courseId) => {
    navigate(`/staff/courses/edit/${courseId}`);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        // Use the new API endpoint for deleting courses
        await apiClient.delete(`/courses/${courseId}`);
        NotificationService.success('Course deleted successfully!');
        fetchCourses(); // Refresh the list
      } catch (error) {
        console.error('Error deleting course:', error);
        NotificationService.error('Failed to delete course');
      }
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.topicName && course.topicName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const paginatedCourses = filteredCourses.slice(
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#059669' }} />
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
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Quản Lý Khóa Học Lập Trình
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Tạo và quản lý các khóa học lập trình cho developers
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/staff/courses/create')}
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#059669',
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
            Tạo Khóa Học Mới
          </Button>
        </Box>
      </Paper>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="Tìm kiếm khóa học..."
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
              width: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f8f9fa'
              }
            }}
          />
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Tổng cộng: <strong>{filteredCourses.length}</strong> khóa học
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Courses Table */}
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
              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Tên Khóa Học</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Chủ Đề</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Mô Tả</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Thời Lượng</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Ngày Tạo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#1976d2' }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((course, index) => (
                <TableRow
                  key={course.id}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f8f9fa',
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
                        src={course.coverImage}
                        sx={{
                          mr: 2,
                          bgcolor: '#1976d2',
                          width: 48,
                          height: 48,
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tạo bởi: {course.creator || 'Staff User'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.topicName || "General"}
                      size="small"
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4
                      }}
                    >
                      {course.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TimeIcon sx={{ mr: 1, fontSize: 18, color: '#1976d2' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {course.duration} giờ
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Chỉnh sửa khóa học">
                        <IconButton
                          onClick={() => handleEditCourse(course.id)}
                          sx={{
                            color: '#059669',
                            '&:hover': {
                              bgcolor: 'rgba(5, 150, 105, 0.1)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa khóa học">
                        <IconButton
                          onClick={() => handleDelete(course.id)}
                          sx={{
                            color: '#d32f2f',
                            '&:hover': {
                              bgcolor: 'rgba(211, 47, 47, 0.1)',
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    No courses found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first course by clicking the "Create Course" button
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {paginatedCourses.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCourses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        )}
      </TableContainer>

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

export default CourseManagement;
