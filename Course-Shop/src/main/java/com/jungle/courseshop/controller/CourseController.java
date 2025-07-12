package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.request.CourseCreateRequest;
import com.jungle.courseshop.dto.request.CourseUpdateRequest;
import com.jungle.courseshop.dto.response.CourseEnrollmentResponse;
import com.jungle.courseshop.dto.response.CourseHomeResponse;
import com.jungle.courseshop.dto.response.CourseResponse;
import com.jungle.courseshop.dto.response.RestResponse;
import com.jungle.courseshop.service.CourseEnrollmentService;
import com.jungle.courseshop.service.CourseService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/courses")
@Slf4j
public class CourseController {
    private final CourseService courseService;
    private final CourseEnrollmentService enrollmentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('LECTURER')")
    public ResponseEntity<RestResponse<CourseResponse>> createCourse(@Valid @ModelAttribute CourseCreateRequest request) throws IOException {
        CourseResponse course = courseService.createCourse(request);
        RestResponse<CourseResponse> response = RestResponse.<CourseResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message("Tạo khóa học thành công")
                .data(course)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('LECTURER')")
    public ResponseEntity<RestResponse<CourseResponse>> updateCourse(@PathVariable Long id, @ModelAttribute CourseUpdateRequest request) throws IOException {
        CourseResponse course = courseService.updateCourse(id, request);
        RestResponse<CourseResponse> response = RestResponse.<CourseResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Cập nhật khóa học thành công")
                .data(course)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('LECTURER')")
    public ResponseEntity<RestResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.softDeleteCourse(id);
        RestResponse<Void> response = RestResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Xóa khóa học thành công (xóa mềm)")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> enrollCourse(@Valid @PathVariable("courseId") Long id) {
        try {
            CourseEnrollmentResponse enrollCourse = enrollmentService.enrollCourse(id);
            RestResponse<CourseEnrollmentResponse> restResponse = RestResponse.<CourseEnrollmentResponse>builder()
                    .statusCode(HttpStatus.CREATED.value())
                    .message("Đăng ký khóa học thành công")
                    .data(enrollCourse)
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(restResponse);
        } catch (RuntimeException | MessagingException | UnsupportedEncodingException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/enrolled")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RestResponse<List<CourseEnrollmentResponse>>> getEnrolledCourses() {
        List<CourseEnrollmentResponse> enrolledCourses = enrollmentService.getEnrolledCourses();
        RestResponse<List<CourseEnrollmentResponse>> response = RestResponse.<List<CourseEnrollmentResponse>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Lấy Danh sách khóa học đã đăng ký Thành công")
                .data(enrolledCourses)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('LECTURER')")
    public ResponseEntity<RestResponse<List<CourseResponse>>> getMyCourses() {
        List<CourseResponse> courses = courseService.getCoursesByLecturer();
        RestResponse<List<CourseResponse>> response = RestResponse.<List<CourseResponse>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Lấy danh sách khóa học của bạn thành công")
                .data(courses)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/videos/watched/{videoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markVideoWatched(@PathVariable Long videoId, @RequestParam boolean watched) throws MessagingException, UnsupportedEncodingException {
        enrollmentService.markVideoAsWatched(videoId, watched);
        RestResponse<Void> response = RestResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Video watched status updated successfully")
                .build();
        return ResponseEntity.ok(response);
    }


}
