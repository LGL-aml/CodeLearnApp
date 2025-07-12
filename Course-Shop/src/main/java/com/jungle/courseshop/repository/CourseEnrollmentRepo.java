package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.Course;
import com.jungle.courseshop.entity.CourseEnrollment;
import com.jungle.courseshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseEnrollmentRepo extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByUser(User user);
    List<CourseEnrollment> findByCourse(Course course);
    Optional<CourseEnrollment> findByUserAndCourse(User user, Course course);
    boolean existsByUserAndCourse(User user, Course course);
    long countByCourse(Course course);
}
