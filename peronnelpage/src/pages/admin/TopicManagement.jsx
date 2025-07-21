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
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
  TablePagination,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Topic as TopicIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import apiClient from '../../services/apiService';

const TopicManagement = () => {
  // States
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Mock data for development
  const mockTopics = [
    {
      id: 1,
      topicName: 'Web Development',
      topicDescription: 'Learn modern web development techniques',
      creatorName: 'Admin User',
      createdAt: '2024-01-15T08:30:00Z',
      updatedAt: '2024-01-15T08:30:00Z'
    },
    {
      id: 2,
      topicName: 'Mobile Development',
      topicDescription: 'Build apps for iOS and Android',
      creatorName: 'Admin User',
      createdAt: '2024-01-16T10:15:00Z',
      updatedAt: '2024-01-16T10:15:00Z'
    },
    {
      id: 3,
      topicName: 'Data Science',
      topicDescription: 'Analyze data and build machine learning models',
      creatorName: 'Admin User',
      createdAt: '2024-01-17T14:20:00Z',
      updatedAt: '2024-01-17T14:20:00Z'
    },
    {
      id: 4,
      topicName: 'DevOps',
      topicDescription: 'Learn CI/CD, Docker, and Kubernetes',
      creatorName: 'Admin User',
      createdAt: '2024-01-18T09:45:00Z',
      updatedAt: '2024-01-18T09:45:00Z'
    }
  ];

  // Load data on component mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      // Since we don't have an API endpoint for listing topics yet, we'll use mock data
      console.log('Using mock data for topics as the API endpoint is not available yet');
      setTopics(mockTopics);
      
      // When the API is available, uncomment the following:
      // const response = await apiClient.get('/api/admin/topics');
      // setTopics(response.data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      showSnackbar('Không thể tải danh sách chủ đề', 'error');
      // Use mock data for development
      setTopics(mockTopics);
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

  const handleOpenDialog = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        name: topic.topicName || '',
        description: topic.topicDescription || ''
      });
    } else {
      setEditingTopic(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTopic(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      showSnackbar('Vui lòng nhập tên chủ đề', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const topicData = {
        name: formData.name,
        description: formData.description || ''
      };

      if (editingTopic) {
        // Update topic
        await apiClient.patch(`/api/admin/topic/${editingTopic.id}`, topicData);
        showSnackbar('Cập nhật chủ đề thành công!', 'success');
      } else {
        // Create new topic
        await apiClient.post('/api/admin/topic', topicData);
        showSnackbar('Tạo chủ đề thành công!', 'success');
      }

      handleCloseDialog();
      fetchTopics();
    } catch (error) {
      console.error('Error saving topic:', error);
      showSnackbar('Có lỗi xảy ra khi lưu chủ đề', 'error');
    }
  };

  const handleDelete = async (topicId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
      try {
        await apiClient.patch(`/api/admin/topic/delete/${topicId}`);
        showSnackbar('Xóa chủ đề thành công!', 'success');
        fetchTopics();
      } catch (error) {
        console.error('Error deleting topic:', error);
        showSnackbar('Có lỗi xảy ra khi xóa chủ đề', 'error');
      }
    }
  };

  // Filter topics based on search term
  const filteredTopics = topics.filter(topic =>
    topic.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.topicDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const paginatedTopics = filteredTopics.slice(
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
              Quản Lý Chủ Đề
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Quản lý các chủ đề khóa học trong hệ thống
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
            Thêm Chủ Đề
          </Button>
        </Box>
      </Paper>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc mô tả chủ đề..."
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
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end">
              <Typography variant="body2" color="text.secondary">
                Tổng cộng: <strong>{filteredTopics.length}</strong> chủ đề
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Topics Table */}
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
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Tên Chủ Đề</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Mô Tả</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Người Tạo</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Ngày Tạo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTopics.map((topic) => (
              <TableRow
                key={topic.id}
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
                    <TopicIcon sx={{ mr: 2, color: '#3b82f6' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {topic.topicName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {topic.topicDescription || 'Không có mô tả'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {topic.creatorName || 'Admin'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(topic.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Chỉnh sửa chủ đề">
                      <IconButton
                        onClick={() => handleOpenDialog(topic)}
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
                    <Tooltip title="Xóa chủ đề">
                      <IconButton
                        onClick={() => handleDelete(topic.id)}
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
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTopics.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </TableContainer>

      {/* Create/Edit Topic Dialog */}
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
          <TopicIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="div">
            {editingTopic ? 'Chỉnh Sửa Chủ Đề' : 'Thêm Chủ Đề Mới'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#1e293b', fontWeight: 600 }}>
              {editingTopic ? 'Cập nhật thông tin chủ đề' : 'Thông tin chủ đề mới'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điền đầy đủ thông tin để {editingTopic ? 'cập nhật' : 'tạo'} chủ đề
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Topic Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên Chủ Đề"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                variant="outlined"
                placeholder="Nhập tên chủ đề..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TopicIcon color="primary" />
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

            {/* Topic Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô Tả"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                variant="outlined"
                placeholder="Nhập mô tả chủ đề..."
                multiline
                rows={4}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
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
              {editingTopic ? 'Cập Nhật' : 'Tạo Chủ Đề'}
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

export default TopicManagement; 