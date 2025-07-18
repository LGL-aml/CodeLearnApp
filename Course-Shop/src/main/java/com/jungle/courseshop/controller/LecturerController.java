package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.request.TopicRequest;
import com.jungle.courseshop.dto.response.RestResponse;
import com.jungle.courseshop.dto.response.TopicResponse;
import com.jungle.courseshop.repository.TopicRepo;
import com.jungle.courseshop.service.CourseService;
import com.jungle.courseshop.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class LecturerController {

    private TopicService topicService;
    private CourseService courseService;



    @GetMapping("/topics")
    public ResponseEntity<RestResponse<List<TopicResponse>>> getAllTopicsByMe() {
        List<TopicResponse> topics = topicService.getTopicsCreatedByCurrentUser();
        RestResponse<List<TopicResponse>> response = new RestResponse<>(HttpStatus.OK.value(), null, "Topics fetched successfully", topics);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/course/{id}/delete")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try{
            courseService.deleteCourse(id);
            return ResponseEntity.ok(Map.of("message", "Khóa học đã được xóa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

}
