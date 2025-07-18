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

const CourseManagement = () => {
  // States
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    topicId: '',
    description: '',
    content: '',
    duration: 0,
    coverImage: null
  });

  // Load data on component mount
  useEffect(() => {
    fetchCourses();
    fetchTopics();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/courses');
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showSnackbar('Không thể tải danh sách khóa học', 'error');
      // Mock data for development
      setCourses([
        {
          id: 1,
          title: 'React Hooks Advanced',
          topicName: 'Frontend Development',
          description: 'Học các React Hooks nâng cao và custom hooks',
          duration: 120,
          createdAt: '2024-01-15',
          creatorName: 'John Doe'
        },
        {
          id: 2,
          title: 'Node.js API Development',
          topicName: 'Backend Development',
          description: 'Xây dựng RESTful API với Node.js và Express',
          duration: 180,
          createdAt: '2024-01-10',
          creatorName: 'Jane Smith'
        },
        {
          id: 3,
          title: 'Python Data Science',
          topicName: 'Data Science',
          description: 'Phân tích dữ liệu với Python, Pandas và NumPy',
          duration: 240,
          createdAt: '2024-01-08',
          creatorName: 'Mike Johnson'
        }
      ]);
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
      // Mock data for development
      setTopics([
        { id: 1, topicName: 'Frontend Development' },
        { id: 2, topicName: 'Backend Development' },
        { id: 3, topicName: 'Data Science' },
        { id: 4, topicName: 'Mobile Development' },
        { id: 5, topicName: 'DevOps' }
      ]);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title || '',
        topicId: course.topicId || '',
        description: course.description || '',
        content: course.content || '',
        duration: course.duration || 0,
        coverImage: null
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        topicId: '',
        description: '',
        content: '',
        duration: 0,
        coverImage: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      topicId: '',
      description: '',
      content: '',
      duration: 0,
      coverImage: null
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.topicId || !formData.description) {
        showSnackbar('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
      }

      const courseData = {
        ...formData,
        duration: parseInt(formData.duration) || 0
      };

      if (editingCourse) {
        // Update course
        await apiClient.put(`/courses/${editingCourse.id}`, courseData);
        showSnackbar('Cập nhật khóa học thành công!', 'success');
      } else {
        // Create new course
        await apiClient.post('/courses', courseData);
        showSnackbar('Tạo khóa học thành công!', 'success');
      }

      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      showSnackbar('Có lỗi xảy ra khi lưu khóa học', 'error');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await apiClient.delete(`/courses/${courseId}`);
        showSnackbar('Xóa khóa học thành công!', 'success');
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        showSnackbar('Có lỗi xảy ra khi xóa khóa học', 'error');
      }
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.topicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <CircularProgress />
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
            onClick={() => handleOpenDialog()}
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
            {paginatedCourses.map((course, index) => (
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
                        Tạo bởi: {course.creatorName || 'Staff User'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={course.topicName}
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
                      {course.duration} phút
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
                        onClick={() => handleOpenDialog(course)}
                        sx={{
                          color: '#1976d2',
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.1)',
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
            ))}
          </TableBody>
        </Table>
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
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: '#1976d2',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 3
        }}>
          <SchoolIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="div">
            {editingCourse ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#1976d2', fontWeight: 600 }}>
              {editingCourse ? 'Cập nhật thông tin khóa học' : 'Thông tin khóa học mới'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điền đầy đủ thông tin chi tiết để {editingCourse ? 'cập nhật' : 'tạo'} khóa học chất lượng
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Row 1: Title - Full width */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên Khóa Học"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                variant="outlined"
                placeholder="Nhập tên khóa học..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon color="primary" />
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

            {/* Row 2: Topic and Duration - Balanced layout */}
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                select
                label="Chủ Đề"
                value={formData.topicId}
                onChange={(e) => handleInputChange('topicId', e.target.value)}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              >
                <MenuItem value="">
                  <em>Chọn chủ đề...</em>
                </MenuItem>
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={topic.topicName}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                type="number"
                label="Thời Lượng (phút)"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                variant="outlined"
                placeholder="0"
                InputProps={{
                  inputProps: { min: 0, max: 999 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon color="primary" />
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

            {/* Row 3: Description - Optimized height */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mô Tả Khóa Học"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                variant="outlined"
                placeholder="Mô tả ngắn gọn về nội dung và mục tiêu của khóa học..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Row 4: Content - Optimized height */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Nội Dung Chi Tiết"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                variant="outlined"
                placeholder="Nhập nội dung chi tiết của khóa học, bao gồm các chương, bài học, mục tiêu học tập..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
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
                borderColor: '#d32f2f',
                color: '#d32f2f',
                fontWeight: 600,
                minWidth: 140,
                '&:hover': {
                  borderColor: '#d32f2f',
                  bgcolor: 'rgba(211, 47, 47, 0.04)',
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
                bgcolor: '#1976d2',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                minWidth: 180,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  bgcolor: '#1565c0',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {editingCourse ? 'Cập Nhật Khóa Học' : 'Tạo Khóa Học'}
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

export default CourseManagement;
