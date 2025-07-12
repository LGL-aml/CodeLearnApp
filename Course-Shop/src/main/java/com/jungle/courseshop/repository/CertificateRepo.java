package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.Certificate;
import com.jungle.courseshop.entity.Course;
import com.jungle.courseshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CertificateRepo extends JpaRepository<Certificate, Long> {
    boolean existsByUserAndCourse(User user, Course course);
    Optional<Certificate> findByUserIdAndCourseId(Long userId, Long courseId);
}
