package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.request.TopicRequest;
import com.jungle.courseshop.dto.response.CourseResponse;
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

    private final TopicService topicService;
    private final CourseService courseService;



    @GetMapping("/topics")
    public ResponseEntity<RestResponse<List<TopicResponse>>> getAllTopicsByMe() {
        List<TopicResponse> topics = topicService.getTopicsCreatedByCurrentUser();
        RestResponse<List<TopicResponse>> response = new RestResponse<>(HttpStatus.OK.value(), null, "Topics fetched successfully", topics);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses")
    public ResponseEntity<RestResponse<List<CourseResponse>>> getMyCourses() {
        try {
            List<CourseResponse> courses = courseService.getCreatedCourses();
            RestResponse<List<CourseResponse>> response = new RestResponse<>(HttpStatus.OK.value(), null, "Courses fetched successfully", courses);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("course/{id}")
    public ResponseEntity<RestResponse<CourseResponse>> getCourse(@PathVariable Long id) {
        CourseResponse courseResponse = courseService.getCourseById(id);
        if (courseResponse == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
        RestResponse<CourseResponse> response = new RestResponse<>(HttpStatus.OK.value(), null, "Course fetched successfully", courseResponse);
        return ResponseEntity.ok(response);
    }

}
