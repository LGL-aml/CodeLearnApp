package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.Course;
import com.jungle.courseshop.entity.CourseVideo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseVideoRepo extends JpaRepository<CourseVideo, Long> {
    long countByCourseModule_Course(Course course);
}
