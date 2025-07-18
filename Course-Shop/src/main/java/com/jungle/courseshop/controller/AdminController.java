package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.request.RegisterRequest;
import com.jungle.courseshop.dto.request.TopicRequest;
import com.jungle.courseshop.dto.request.UpdateUserRequest;
import com.jungle.courseshop.dto.response.RegisterResponse;
import com.jungle.courseshop.dto.response.TopicResponse;
import com.jungle.courseshop.dto.response.UpdateUserResponse;
import com.jungle.courseshop.entity.ApprovalStatus;
import com.jungle.courseshop.service.CourseService;
import com.jungle.courseshop.service.TopicService;
import com.jungle.courseshop.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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


    @PatchMapping(value = "/users/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @ModelAttribute UpdateUserRequest request) {
        try {
            UpdateUserResponse response = userService.updateUserProfile(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Lỗi: " + e.getMessage())
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @PatchMapping("/users/delete/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "Người dùng đã được xóa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Lỗi: " + e.getMessage())
            );
        }
    }

    @PatchMapping("/course/{id}/approval")
    public ResponseEntity<?> approvalCourse(@PathVariable Long id, @RequestParam("status") ApprovalStatus status) {
        String message = "";
        if(status.equals(ApprovalStatus.APPROVED)) {
            message = "Khóa học đã được phê duyệt thành công";
        } else if(status.equals(ApprovalStatus.REJECTED)) {
            message = "Khóa học đã bị từ chối";
        } else {
            message = "Trạng thái không hợp lệ";
            return ResponseEntity.badRequest().body(message);
        }
        courseService.updateStatus(id, status);
        return ResponseEntity.ok(message);
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
