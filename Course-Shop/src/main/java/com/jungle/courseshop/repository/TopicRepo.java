package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TopicRepo extends JpaRepository<Topic, Long> {
    boolean existsByNameIgnoreCase(String name);
    List<Topic> findByCreator_UsernameAndActive(String creatorUsername, boolean active);
    List<Topic> findTopicByActiveTrue();
    Topic findByIdAndActive(Long id, Boolean active);
}
