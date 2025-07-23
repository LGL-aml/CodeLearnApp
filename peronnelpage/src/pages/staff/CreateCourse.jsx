import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  MenuItem,
  IconButton,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import apiClient from '../../services/apiService';
import { API_URL } from '../../services/config';
import { getAccessToken } from '../../utils/auth';
import NotificationService from '../../services/NotificationService';

const CreateCourse = () => {
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  const editorRef = useRef(null);
  
  // Main course state
  const [course, setCourse] = useState({
    title: '',
    topicId: '',
    description: '',
    content: '',
    duration: 0,
    coverImage: null,
    modules: []
  });

  // Additional states
  const [topics, setTopics] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [lastSaved, setLastSaved] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data: topics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setApiError(null);
        
        // Fetch topics with apiClient
        try {
          console.log('Fetching topics...');
          
          // Use apiClient to fetch topics
          const response = await apiClient.get('/topics');
          const data = response.data;
          
          console.log('Topics API response:', data);
          
          // Even if the API returns empty array, we'll handle it gracefully
          if (Array.isArray(data)) {
            setTopics(data);
            console.log('Topics loaded:', data.length);
          } else {
            console.error('Topics data format error - not an array:', data);
            setApiError('Topics data format error - not an array');
          }
        } catch (topicError) {
          console.error('Error fetching topics:', topicError);
          setApiError(`Error loading topics: ${topicError.message}`);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchData();

    // Load draft if available
    const savedDraft = localStorage.getItem('courseDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setCourse(parsedDraft);
        if (parsedDraft.coverImage && parsedDraft.imagePreview) {
          setImagePreview(parsedDraft.imagePreview);
        }
        showSnackbar('Draft loaded successfully', 'info');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }

    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Save draft to local storage
  const saveDraft = () => {
    try {
      if (editorRef.current) {
        const editorContent = editorRef.current.getContent();
        const updatedCourse = {
          ...course,
          content: editorContent,
          imagePreview: imagePreview
        };
        localStorage.setItem('courseDraft', JSON.stringify(updatedCourse));
        setLastSaved(new Date());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourse(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Module management functions
  const addModule = () => {
    const newModule = {
      title: '',
      description: '',
      content: '',
      orderIndex: course.modules.length + 1,
      videos: []
    };
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const updateModule = (index, field, value) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      updatedModules[index] = {
        ...updatedModules[index],
        [field]: value
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const deleteModule = (index) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      updatedModules.splice(index, 1);
      
      // Update order indices
      const reindexedModules = updatedModules.map((mod, idx) => ({
        ...mod,
        orderIndex: idx + 1
      }));
      
      return { ...prev, modules: reindexedModules };
    });
  };

  // Video management functions
  const addVideo = (moduleIndex) => {
    const newVideo = {
      title: '',
      videoUrl: ''
    };
    
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        videos: [...updatedModules[moduleIndex].videos, newVideo]
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const updateVideo = (moduleIndex, videoIndex, field, value) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      const updatedVideos = [...updatedModules[moduleIndex].videos];
      updatedVideos[videoIndex] = {
        ...updatedVideos[videoIndex],
        [field]: value
      };
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        videos: updatedVideos
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const deleteVideo = (moduleIndex, videoIndex) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      const updatedVideos = [...updatedModules[moduleIndex].videos];
      updatedVideos.splice(videoIndex, 1);
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        videos: updatedVideos
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Snackbar management
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get current content from editor ref
    const currentContent = editorRef.current ? editorRef.current.getContent() : course.content;
    
    if (!course.title || !course.topicId || !course.description || !currentContent) {
      showSnackbar('Vui lòng điền đầy đủ các trường bắt buộc', 'error');
      return;
    }

    // Set submitting state
    setIsSubmitting(true);
    // Show processing notification
    showSnackbar('Đang xử lý yêu cầu...', 'info');

    try {
      const token = getAccessToken();
      
      // Build the final data structure based on all collected course information
      const courseData = {
        title: course.title,
        topicId: course.topicId,
        description: course.description,
        content: currentContent,
        duration: course.duration,
        coverImage: course.coverImage,
        modules: course.modules
      };

      // Prepare form data for submission with files
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('topicId', courseData.topicId);
      formData.append('description', courseData.description);
      formData.append('content', courseData.content);
      formData.append('duration', courseData.duration);
      
      if (courseData.coverImage) {
        formData.append('coverImage', courseData.coverImage);
      }
      
      // Append modules as JSON string
      formData.append('modules', JSON.stringify(courseData.modules));
      
      // Log for debugging
      console.log('Submitting course form data with modules:', courseData.modules.length);

      // Make the API call
      const response = await apiClient.post('/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Course creation response:', response);
      NotificationService.success('Tạo khóa học thành công!');
      
      // Clear the form and draft
      localStorage.removeItem('courseDraft');
      setCourse({
        title: '',
        topicId: '',
        description: '',
        content: '',
        duration: 0,
        coverImage: null,
        modules: []
      });
      setImagePreview(null);
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
      
    } catch (error) {
      console.error('Error creating course:', error);
      // More detailed error message
      let errorMsg = 'Lỗi khi tạo khóa học';
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMsg += `: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMsg += ': Không nhận được phản hồi từ máy chủ, vui lòng thử lại sau';
      } else {
        // Something happened in setting up the request
        errorMsg += `: ${error.message}`;
      }
      NotificationService.error(errorMsg);
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  // Handle saving draft
  const handleSaveDraft = () => {
    if (saveDraft()) {
      showSnackbar('Lưu nháp thành công!', 'success');
    } else {
      showSnackbar('Lỗi khi lưu nháp', 'error');
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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
              Tạo Khóa Học Mới
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Tạo một khóa học lập trình mới với các mô-đun và video
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Course title */}
        <TextField
          fullWidth
          label="Tên Khóa Học"
          name="title"
          value={course.title}
          onChange={handleChange}
          variant="outlined"
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 1
            }
          }}
        />
        
        {/* Topic and Image side by side */}
        <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
          {/* Topic selection */}
          <TextField
            select
            fullWidth
            label="Chủ Đề"
            name="topicId"
            value={course.topicId}
            onChange={handleChange}
            variant="outlined"
            sx={{ 
              flex: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 1
              }
            }}
            error={!!apiError}
            helperText={apiError ? 'Lỗi khi tải chủ đề' : ''}
          >
            {topics.length === 0 && (
              <MenuItem disabled value="">
                Không có chủ đề nào - Kiểm tra lỗi trong console
              </MenuItem>
            )}
            
            {topics.map(topic => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.topicName || "Chủ đề không có tên"}
              </MenuItem>
            ))}
          </TextField>
          
          {/* Image upload */}
          <Box
            sx={{
              flex: 1,
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: 1,
              height: 56,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              backgroundColor: 'white'
            }}
          >
            {!imagePreview ? (
              <Button 
                component="label"
                fullWidth
                sx={{ height: '100%' }}
              >
                Chọn Ảnh
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            ) : (
              <>
                <img
                  src={imagePreview}
                  alt="Ảnh xem trước"
                  style={{ maxWidth: '100%', maxHeight: 54, objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.7)'
                  }}
                  onClick={() => {
                    setImagePreview(null);
                    setCourse(prev => ({ ...prev, coverImage: null }));
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
        
        {/* Description */}
        <TextField
          fullWidth
          label="Mô Tả"
          name="description"
          value={course.description}
          onChange={handleChange}
          variant="outlined"
          multiline
          rows={3}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 1
            }
          }}
        />
        
        {/* TinyMCE Editor */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium">Nội Dung Khóa Học</Typography>
          </Box>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              height: 500, 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="text.secondary">
                Trình Soạn Thảo WYSIWYG
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Editor
                apiKey="dpd386vjz5110tuev4munelye54caj3z0xj031ujmmahsu4h"
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                }}
                initialValue={course.content}
                init={{
                  height: '100%',
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                    'codesample'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | link image media | code preview fullscreen',
                  content_style: `
                    body { 
                      font-family: Helvetica, Arial, sans-serif; 
                      font-size: 14px;
                      direction: ltr;
                      text-align: left;
                    }
                  `,
                  browser_spellcheck: true,
                  directionality: 'ltr',
                  entity_encoding: 'raw',
                  convert_urls: false,
                  setup: function(editor) {
                    editor.on('init', function(e) {
                      editor.getBody().style.direction = 'ltr';
                      editor.getBody().style.textAlign = 'left';
                    });
                  }
                }}
              />
            </Box>
          </Paper>
        </Box>
        
        {/* Duration */}
        <TextField
          fullWidth
          label="Thời Lượng (giờ)"
          name="duration"
          type="number"
          value={course.duration}
          onChange={handleChange}
          variant="outlined"
          InputProps={{
            inputProps: { min: 1, step: 0.5 }
          }}
          sx={{ 
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 1
            }
          }}
        />
        
        <Divider sx={{ my: 3 }} />
        
        {/* Modules section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Mô-đun</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addModule}
              sx={{
                borderColor: '#059669',
                color: '#059669',
                '&:hover': {
                  borderColor: '#047857',
                  backgroundColor: 'rgba(5, 150, 105, 0.04)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Thêm Mô-đun
            </Button>
          </Box>
          
          {course.modules.map((module, moduleIndex) => (
            <Box 
              key={moduleIndex} 
              sx={{ 
                border: '1px solid #c4c4c4',
                borderRadius: '8px',
                p: 3,
                position: 'relative',
                mb: 4,
                backgroundColor: 'white'
              }}
            >
              {/* Delete module button */}
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10,
                  color: '#059669',
                  '&:hover': {
                    backgroundColor: 'rgba(5, 150, 105, 0.1)'
                  }
                }}
                onClick={() => deleteModule(moduleIndex)}
              >
                <CloseIcon />
              </IconButton>
              
              {/* Module order_index field */}
              <TextField
                fullWidth
                label="Thứ Tự"
                type="number"
                value={module.orderIndex}
                InputProps={{
                  readOnly: true
                }}
                variant="outlined"
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 1
                  }
                }}
              />
              
              {/* Module title field */}
              <TextField
                fullWidth
                label="Tên Mô-đun"
                value={module.title}
                onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                variant="outlined"
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 1
                  }
                }}
              />
              
              {/* Add video button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => addVideo(moduleIndex)}
                  sx={{
                    borderColor: '#059669',
                    color: '#059669',
                    '&:hover': {
                      borderColor: '#047857',
                      backgroundColor: 'rgba(5, 150, 105, 0.04)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Thêm Video
                </Button>
              </Box>
              
              {/* Videos list */}
              {module.videos.map((video, videoIndex) => (
                <Box 
                  key={videoIndex} 
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    p: 3,
                    position: 'relative',
                    mb: 2,
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  {/* Delete video button */}
                  <IconButton 
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      color: '#059669',
                      '&:hover': {
                        backgroundColor: 'rgba(5, 150, 105, 0.1)'
                      }
                    }}
                    onClick={() => deleteVideo(moduleIndex, videoIndex)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  
                  {/* Video title */}
                  <TextField
                    fullWidth
                    label="Tên Video"
                    value={video.title}
                    onChange={(e) => updateVideo(moduleIndex, videoIndex, 'title', e.target.value)}
                    variant="outlined"
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 1
                      }
                    }}
                  />
                  
                  {/* Video URL */}
                  <TextField
                    fullWidth
                    label="URL Video"
                    value={video.videoUrl}
                    onChange={(e) => updateVideo(moduleIndex, videoIndex, 'videoUrl', e.target.value)}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 1
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            sx={{
              borderColor: '#059669',
              color: '#059669',
              '&:hover': {
                borderColor: '#047857',
                backgroundColor: 'rgba(5, 150, 105, 0.04)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Lưu Nháp
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
            disabled={isSubmitting}
            sx={{
              bgcolor: '#059669',
              '&:hover': {
                bgcolor: '#047857',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              },
              transition: 'all 0.2s ease',
              boxShadow: '0 3px 8px rgba(5, 150, 105, 0.2)'
            }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Tạo Khóa Học'}
          </Button>
        </Box>
      </Box>
      
      {lastSaved && (
        <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
          Lưu tự động lần cuối: {lastSaved.toLocaleTimeString()}
        </Typography>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'warning' ? null : 6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateCourse; 