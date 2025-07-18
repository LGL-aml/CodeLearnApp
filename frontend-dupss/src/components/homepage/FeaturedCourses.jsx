import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../services/config';



const FeaturedCourses = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/public/courses/latest`);
        setCoursesData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Format duration from hours to display string
  const formatDuration = (hours) => {
    return `${hours} giờ`;
  };

  return (
    <section className="featured-courses">
      <div className="section-container">
        <h2 className="section-title">
          Khóa học Lập trình Nổi bật
        </h2>

        <div className="courses-grid">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Đang tải...
            </div>
          ) : (
            coursesData.map(course => (
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
            ))
          )}

        </div>

        <div className="view-all">
          <a href="/courses">
            <i className="fas fa-graduation-cap"></i>
            Xem tất cả khóa học
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;