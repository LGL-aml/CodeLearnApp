package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.ApprovalStatus;
import com.jungle.courseshop.entity.Course;
import com.jungle.courseshop.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepo extends JpaRepository<Course, Long> {
    List<Course> findByCreatorAndActiveTrue(User creator);
    List<Course> findTop3ByActiveTrueOrderByCreatedAtDesc();
    List<Course> findByActiveTrue();
    Optional<Course> findByIdAndActiveTrue(Long id);

    @Query("SELECT c FROM Course c " +
            "WHERE c.active = true AND " +
            "(:topic IS NULL OR c.topic.id = :topic) AND (" +
            "LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.topic.name) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            ")")
    Page<Course> searchCourses(@Param("keyword") String keyword, @Param("topic") Long Topic,  Pageable pageable);
}
