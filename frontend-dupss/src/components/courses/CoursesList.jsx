import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, TextField, MenuItem, InputAdornment, Pagination, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { API_URL } from '../../services/config';

const sortOptions = [
  { value: 'desc', label: 'Ngày đăng mới nhất' },
  { value: 'asc', label: 'Ngày đăng cũ nhất' },
];

const FilterContainer = Box;
const LoadingOverlay = Box;
const GridWrapper = Box;

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [topicId, setTopicId] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(`${API_URL}/topics`);
        setTopics(response.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  // Debounce search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchQuery(searchInput);
      if (searchInput !== searchQuery) {
        setCurrentPage(1); // Reset to first page on new search
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchInput, searchQuery]);

  // Fetch courses based on filters
  useEffect(() => {
    document.title = "Khóa học - DUPSS";
    
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/public/courses?keyword=${searchQuery}&page=${currentPage}&sortBy=createdAt&sortDir=${sortDir}`;
        
        if (topicId) {
          url += `&topicId=${topicId}`;
        }
        
        const response = await axios.get(url);
        setCourses(response.data.courses);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        
        // After data loading is complete, scroll to top if not initial loading
        if (!initialLoad) {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100); // Short delay to ensure DOM has been updated
        }
      }
    };

    fetchCourses();
  }, [searchQuery, topicId, sortDir, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleTopicChange = (e) => {
    setTopicId(e.target.value);
    setCurrentPage(1); // Reset to first page on topic change
  };

  const handleSortChange = (e) => {
    setSortDir(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Format duration from hours to display string
  const formatDuration = (hours) => {
    return `${hours} giờ`;
  };

  if (initialLoad) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          mb: 4,
          textAlign: 'center',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #58a6ff 0%, #1f6feb 50%, #0969da 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 20px rgba(88, 166, 255, 0.3)',
          fontSize: { xs: '2.5rem', md: '3.5rem' },
          letterSpacing: '-0.02em'
        }}
      >
        Khóa học Lập trình
      </Typography>

      <FilterContainer sx={{
        display: 'flex',
        gap: 2,
        mb: 4,
        flexDirection: {xs: 'column', sm: 'row'},
        p: 3,
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 2,
        border: '1px solid rgba(88, 166, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchChange}
          fullWidth
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Chủ đề"
          value={topicId}
          onChange={handleTopicChange}
          variant="outlined"
          sx={{ minWidth: 200 }}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(88, 166, 255, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }
              }
            }
          }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {topics.map((topic) => (
            <MenuItem key={topic.id} value={topic.id}>
              {topic.topicName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Sắp xếp theo"
          value={sortDir}
          onChange={handleSortChange}
          variant="outlined"
          sx={{ minWidth: 200 }}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(88, 166, 255, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }
              }
            }
          }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </FilterContainer>

      {/* Courses Grid */}
      <Box sx={{ position: 'relative' }}>
        {loading && !initialLoad && (
          <LoadingOverlay sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 2,
          }}>
            <CircularProgress size={40} />
          </LoadingOverlay>
        )}
        
        {courses.length > 0 ? (
          <>
            <div className="courses-grid" style={{ opacity: loading ? 0.5 : 1 }}>
              {courses.map((course) => (
                <div className="course-card" key={course.id}>
                  <div className="course-image">
                    <img
                      src={course.coverImage || 'https://via.placeholder.com/300x200'}
                      alt={course.title}
                    />
                    <span className="course-tag">{course.topicName}</span>
                    <span className="course-duration">
                      <i className="fas fa-clock"></i> {formatDuration(course.duration)}
                    </span>
                  </div>

                  <div className="course-content">
                    <h3>{course.title}</h3>

                    <div className="course-meta">
                      <span>
                        <i className="fas fa-user"></i> {course.creatorName}
                      </span>
                      <span>{new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <p>{course.summary || 'Không có mô tả'}</p>

                    <a href={`/courses/${course.id}`} className="course-btn">
                      Tham gia khóa học
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                disabled={loading}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', my: 5 }}>
            <Typography>Không tìm thấy khóa học nào phù hợp với tiêu chí tìm kiếm</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default CoursesList;