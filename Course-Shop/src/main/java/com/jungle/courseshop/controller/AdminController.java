package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.request.RegisterRequest;
import com.jungle.courseshop.dto.request.TopicRequest;
import com.jungle.courseshop.dto.request.UpdateUserRequest;
import com.jungle.courseshop.dto.response.RegisterResponse;
import com.jungle.courseshop.dto.response.TopicResponse;
import com.jungle.courseshop.dto.response.UpdateUserResponse;
import com.jungle.courseshop.dto.response.UserDetailResponse;
import com.jungle.courseshop.entity.ApprovalStatus;
import com.jungle.courseshop.service.CourseService;
import com.jungle.courseshop.service.TopicService;
import com.jungle.courseshop.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final CourseService courseService;
    private final TopicService topicService;

    @PostMapping(value = "/users", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createUser(@Valid @ModelAttribute RegisterRequest request) {
        try {
            RegisterResponse response = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserDetailResponse>> getAllUsers() {
        List<UserDetailResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }


    @PostMapping("/topic")
    public ResponseEntity<TopicResponse> createTopic(@RequestBody TopicRequest topic) {
        TopicResponse topicRes = topicService.create(topic);
        return ResponseEntity.status(HttpStatus.CREATED).body(topicRes);
    }

    @PatchMapping("/topic/{id}")
    public ResponseEntity<TopicResponse> updateTopic(@PathVariable Long id, @RequestBody TopicRequest topic) {
        TopicResponse topicRes = topicService.update(id, topic);
        return ResponseEntity.ok(topicRes);
    }

    @PatchMapping("/topic/delete/{id}")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.ok("Topic deleted successfully");
    }


}
