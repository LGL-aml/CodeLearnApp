package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.ApprovalStatus;
import com.jungle.courseshop.entity.Course;
import com.jungle.courseshop.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseModuleRepo extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourse_ActiveTrueAndCourse_StatusOrderByOrderIndexAsc(ApprovalStatus course_status);
    List<CourseModule> findByCourse_ActiveTrueOrderByOrderIndexAsc();
    List<CourseModule> findByCourseOrderByOrderIndexAsc(Course course);
}
