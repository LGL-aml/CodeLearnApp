package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.Course;
import com.jungle.courseshop.entity.CourseVideo;
import com.jungle.courseshop.entity.User;
import com.jungle.courseshop.entity.WatchedVideo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WatchedVideoRepo extends JpaRepository<WatchedVideo, Long> {
    boolean existsByUserAndVideoAndWatchedTrue(User user, CourseVideo video);
    Optional<WatchedVideo> findByUserAndVideo(User user, CourseVideo video);
    long countByUserAndVideo_CourseModule_Course_AndWatchedTrue(User user, Course course);
}
