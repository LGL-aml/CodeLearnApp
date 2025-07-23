import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import apiClient from '../../services/apiService';
import { API_URL } from '../../services/config';
import { getAccessToken } from '../../utils/auth';
import NotificationService from '../../services/NotificationService';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
  const [isLoading, setIsLoading] = useState(true);

    // Load course data and topics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        
        // Fetch topics first so we can use them to match with the course
        let loadedTopics = [];
        try {
          const response = await apiClient.get('/topics');
          const data = response.data;
          
          if (Array.isArray(data)) {
            console.log("Topics loaded:", data);
            // Ensure topic IDs are strings for consistent comparison
            loadedTopics = data.map(topic => ({
              ...topic,
              id: topic.id.toString()
            }));
            setTopics(loadedTopics);
          } else {
            console.error('Topics data format error - not an array:', data);
            setApiError('Topics data format error - not an array');
          }
        } catch (topicError) {
          console.error('Error fetching topics:', topicError);
          setApiError(`Error loading topics: ${topicError.message}`);
        }
        
        // Now fetch course details
        try {
          // Try to get the course details from the my courses endpoint first
          const myCoursesResponse = await apiClient.get('/courses/my');
          let courseData;
          
          // Check if the response has data in the expected format
          if (myCoursesResponse.data && Array.isArray(myCoursesResponse.data)) {
            courseData = myCoursesResponse.data.find(course => course.id.toString() === id.toString());
          } else if (myCoursesResponse.data && Array.isArray(myCoursesResponse.data.data)) {
            courseData = myCoursesResponse.data.data.find(course => course.id.toString() === id.toString());
          }
          
          if (!courseData) {
            throw new Error('Course not found in your courses');
          }
          
          console.log("Raw course data:", courseData);
          
          // Try to determine the topic ID from various possible sources
          let topicId = '';
          if (courseData.topicId) {
            topicId = courseData.topicId.toString();
          } else if (courseData.topic && courseData.topic.id) {
            topicId = courseData.topic.id.toString();
          } else if (courseData.topicName) {
            // If we have a topicName but no ID, try to find it in the topics list
            const matchingTopic = loadedTopics.find(t => 
              t.topicName && t.topicName.toLowerCase() === courseData.topicName.toLowerCase()
            );
            if (matchingTopic) {
              topicId = matchingTopic.id.toString();
            }
          }
          
          console.log("Determined topicId:", topicId);
          console.log("Available topics:", loadedTopics);
          
          // Format the course data
          setCourse({
            title: courseData.title || '',
            topicId: topicId,
            description: courseData.description || '',
            content: courseData.content || '',
            duration: courseData.duration || 0,
            coverImage: null,
            modules: courseData.modules || []
          });
          
          // Set image preview if available
          if (courseData.coverImage) {
            setImagePreview(courseData.coverImage);
          }
          
        } catch (courseError) {
          console.error('Error fetching course details:', courseError);
          setApiError(`Error loading course: ${courseError.message}`);
          NotificationService.error(`Error loading course: ${courseError.message}`);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [id]);

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
        localStorage.setItem(`courseDraft_${id}`, JSON.stringify(updatedCourse));
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
    console.log(`Changing ${name} to:`, value);
    setCourse(prev => ({ ...prev, [name]: value }));
  };
  
  // Effect to ensure topic is selected after both topics and course data are loaded
  useEffect(() => {
    if (course.topicId && topics.length > 0) {
      console.log("Checking topic selection:", {
        courseTopicId: course.topicId,
        availableTopics: topics.map(t => t.id)
      });
      
      // Ensure the topicId is a string for comparison
      const topicIdStr = course.topicId.toString();
      
      // Check if the current topicId exists in the topics list
      const topicExists = topics.some(topic => topic.id.toString() === topicIdStr);
      
      if (!topicExists) {
        console.log("Selected topic not found in topics list, trying to find by name");
        // Try to find by name if available
        const courseData = { ...course };
        if (courseData.topicName) {
          const matchingTopic = topics.find(t => 
            t.topicName && t.topicName.toLowerCase() === courseData.topicName.toLowerCase()
          );
          if (matchingTopic) {
            console.log("Found matching topic by name:", matchingTopic);
            setCourse(prev => ({ ...prev, topicId: matchingTopic.id.toString() }));
          }
        }
      }
    }
  }, [course.topicId, topics]);

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
        videos: [...(updatedModules[moduleIndex].videos || []), newVideo]
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const updateVideo = (moduleIndex, videoIndex, field, value) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      const updatedVideos = [...(updatedModules[moduleIndex].videos || [])];
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
      const updatedVideos = [...(updatedModules[moduleIndex].videos || [])];
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
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    // Set submitting state
    setIsSubmitting(true);
    // Show processing notification
    showSnackbar('Processing request...', 'info');

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
      
      // Make the API call to update the course
      let response;
      
      try {
        // Try PATCH first
        response = await apiClient.patch(`/courses/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (patchError) {
        console.error('PATCH request failed, trying PUT instead:', patchError);
        // If PATCH fails with 405, try PUT instead
        response = await apiClient.put(`/courses/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      console.log('Course update response:', response);
      NotificationService.success('Course updated successfully!');
      
      // Clear the draft
      localStorage.removeItem(`courseDraft_${id}`);
      
      // Navigate back to course management
      navigate('/staff/courses');
      
    } catch (error) {
      console.error('Error updating course:', error);
      // More detailed error message
      let errorMsg = 'Error updating course';
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMsg += `: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMsg += ': No response received from server, please try again later';
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
      showSnackbar('Draft saved successfully!', 'success');
    } else {
      showSnackbar('Error saving draft', 'error');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} sx={{ color: '#059669' }} />
      </Box>
    );
  }

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
              Edit Course
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Update your course information, modules and videos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/staff/courses')}
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
            Back to Courses
          </Button>
        </Box>
      </Paper>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Course title */}
        <TextField
          fullWidth
          label="Course Title"
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
            label="Topic"
            name="topicId"
            value={course.topicId || ''}
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
            helperText={apiError ? 'Error loading topics' : ''}
          >
            <MenuItem value="">
              <em>Select a topic</em>
            </MenuItem>
            
            {topics.length === 0 ? (
              <MenuItem disabled value="">
                No topics available - Check console for errors
              </MenuItem>
            ) : (
              topics.map(topic => {
                console.log(`Rendering topic option: ${topic.topicName} (${topic.id}), selected: ${course.topicId === topic.id.toString()}`);
                return (
                  <MenuItem key={topic.id} value={topic.id.toString()}>
                    {topic.topicName || "Unnamed Topic"}
                  </MenuItem>
                );
              })
            )}
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
                Choose Image
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
                  alt="Course preview"
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
          label="Description"
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
            <Typography variant="body1" fontWeight="medium">Course Content</Typography>
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
                WYSIWYG Editor
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
          label="Duration (hours)"
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
            <Typography variant="h6">Modules</Typography>
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
              Add Module
            </Button>
          </Box>
          
          {course.modules && course.modules.map((module, moduleIndex) => (
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
                label="Order Index"
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
                label="Module Title"
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
                  Add Video
                </Button>
              </Box>
              
              {/* Videos list */}
              {module.videos && module.videos.map((video, videoIndex) => (
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
                    label="Video Title"
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
                    label="Video URL"
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
            Save Draft
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
            {isSubmitting ? 'Processing...' : 'Update Course'}
          </Button>
        </Box>
      </Box>
      
      {lastSaved && (
        <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
          Last auto-save: {lastSaved.toLocaleTimeString()}
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

export default EditCourse; 