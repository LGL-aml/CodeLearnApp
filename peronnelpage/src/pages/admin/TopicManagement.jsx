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
import apiClient, { apiService } from '../../services/apiService';
import notificationService from '../../services/NotificationService.jsx';

const TopicManagement = () => {
  // States
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Load data on component mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      // Fetch topics from API
      try {
        const response = await apiClient.get('/topics');
        if (response.data && Array.isArray(response.data)) {
          setTopics(response.data);
        } else {
          // Handle unexpected API response format
          console.log('API response is not in expected format:', response.data);
          notificationService.error('Không thể tải danh sách chủ đề: Định dạng dữ liệu không đúng');
          setTopics([]);
        }
      } catch (apiError) {
        console.error('Error fetching topics from API:', apiError);
        
        // Extract and show error message from API response if available
        if (apiError.response && apiError.response.data) {
          const errorData = apiError.response.data;
          const errorMessage = errorData.message || 'Không thể tải danh sách chủ đề';
          notificationService.error(errorMessage);
        } else {
          notificationService.error('Không thể tải danh sách chủ đề');
        }
        
        // Set empty topics array if API call fails
        setTopics([]);
      }
    } catch (error) {
      console.error('Error in fetchTopics:', error);
      notificationService.error('Không thể tải danh sách chủ đề');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      const initialFormData = {
        name: topic.topicName || '',
        description: topic.topicDescription || ''
      };
      setFormData(initialFormData);
      setOriginalFormData(initialFormData);
      setHasChanges(false);
    } else {
      setEditingTopic(null);
      const newFormData = {
        name: '',
        description: ''
      };
      setFormData(newFormData);
      setOriginalFormData({});
      setHasChanges(true); // Always allow creation of new topics
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
    setOriginalFormData({});
    setHasChanges(false);
  };

  const handleInputChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    
    // Check if there are changes compared to original data
    if (editingTopic) {
      // For editing, compare with original data
      const hasAnyChange = Object.keys(originalFormData).some(key => {
        return newFormData[key] !== originalFormData[key];
      });
      
      setHasChanges(hasAnyChange);
    } else {
      // For new topic, always allow submission
      setHasChanges(true);
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      notificationService.error('Vui lòng nhập tên chủ đề');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const topicData = {
        name: formData.name,
        description: formData.description || ''
      };

      if (editingTopic) {
        // Update topic
        await apiClient.patch(`/admin/topic/${editingTopic.id}`, topicData);
        notificationService.success('Cập nhật chủ đề thành công!');
        handleCloseDialog();
        fetchTopics();
      } else {
        // Create new topic
        await apiClient.post('/admin/topic', topicData);
        notificationService.success('Tạo chủ đề thành công!');
        handleCloseDialog();
        fetchTopics();
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      
      // Extract and show error message from API response if available
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Có lỗi xảy ra khi lưu chủ đề';
        notificationService.error(errorMessage);
      } else {
        notificationService.error('Có lỗi xảy ra khi lưu chủ đề');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (topicId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
      try {
        setLoading(true);
        await apiClient.patch(`/admin/topic/delete/${topicId}`);
        notificationService.success('Xóa chủ đề thành công!');
        fetchTopics();
      } catch (error) {
        console.error('Error deleting topic:', error);
        
        // Extract and show error message from API response if available
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          const errorMessage = errorData.message || 'Có lỗi xảy ra khi xóa chủ đề';
          notificationService.error(errorMessage);
        } else {
          notificationService.error('Có lỗi xảy ra khi xóa chủ đề');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter topics based on search term only
  const filteredTopics = topics.filter(topic => {
    return (topic.topicName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      topic.topicDescription?.toLowerCase().includes(searchTerm.toLowerCase()));
  });

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
          <Grid item xs={12} md={9}>
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
          <Grid item xs={12} md={3}>
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
              <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Ngày Cập Nhật</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTopics.map((topic) => (
              <Tooltip 
                title="Nhấn để xem chi tiết và chỉnh sửa" 
                placement="top"
                arrow
                key={topic.id}
              >
                <TableRow
                  onClick={() => handleOpenDialog(topic)}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f1f5f9',
                      transform: 'scale(1.001)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '& .MuiTableCell-root': {
                        color: '#1e40af'
                      },
                      '& .topic-name': {
                        color: '#2563eb'
                      }
                    },
                    '&:nth-of-type(even)': {
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <TopicIcon sx={{ mr: 2, color: '#3b82f6' }} />
                    <Typography variant="subtitle1" className="topic-name" sx={{ fontWeight: 600 }}>
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
                    {topic.createdAt || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {topic.updatedAt || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Chỉnh sửa chủ đề">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(topic);
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
                    <Tooltip title="Xóa chủ đề">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(topic.id);
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
            </Tooltip>
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
          justifyContent: 'center',
          gap: 2,
          py: 3
        }}>
          <TopicIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="div">
            {editingTopic ? 'Chỉnh Sửa Chủ Đề' : 'Thêm Chủ Đề Mới'}
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
              {editingTopic ? 'Cập nhật thông tin chủ đề' : 'Thông tin chủ đề mới'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điền đầy đủ thông tin để {editingTopic ? 'cập nhật' : 'tạo'} chủ đề
            </Typography>
          </Box>

          <Box sx={{ width: '100%', maxWidth: '500px', mx: 'auto' }}>
            {/* Topic Name */}
            <Box sx={{ mb: 3 }}>
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
                      <TopicIcon color="primary" sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
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
                }}
              />
            </Box>

            {/* Topic Description */}
            <Box sx={{ mb: 3 }}>
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
                      <DescriptionIcon color="primary" sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  },
                  '& .MuiInputAdornment-root': {
                    alignSelf: 'flex-start',
                    marginTop: '16px',
                    minWidth: 40,
                    display: 'flex',
                    justifyContent: 'center'
                  }
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
            {editingTopic && !hasChanges && (
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                Chưa có thay đổi nào để cập nhật
              </Typography>
            )}
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
              disabled={loading || (editingTopic && !hasChanges)}
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
                transition: 'all 0.2s ease',
                '&.Mui-disabled': {
                  bgcolor: '#94a3b8',
                  color: 'white'
                }
              }}
            >
              {editingTopic ? 'Cập Nhật' : 'Tạo Chủ Đề'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopicManagement; 