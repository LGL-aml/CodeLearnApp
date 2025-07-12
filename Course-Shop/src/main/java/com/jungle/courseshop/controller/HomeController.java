package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.response.CertificateResponse;
import com.jungle.courseshop.dto.response.CourseDetailPublicResponse;
import com.jungle.courseshop.dto.response.CourseHomeResponse;
import com.jungle.courseshop.dto.response.RestResponse;
import com.jungle.courseshop.service.CourseEnrollmentService;
import com.jungle.courseshop.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/public")
@Slf4j
public class HomeController {

    private final CourseService courseService;
    private final CourseEnrollmentService courseEnrollmentService;

    @GetMapping("/courses/latest")
    public ResponseEntity<RestResponse<List<CourseHomeResponse>>> getLatestCourses() {
        List<CourseHomeResponse> latestCourses = courseService.getLastestCourses();
        RestResponse<List<CourseHomeResponse>> response = new RestResponse<>(HttpStatus.OK.value(), null, "Latest courses fetched successfully", latestCourses);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getAllCourses(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Long topicId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        int pageIndex = page > 0 ? page - 1 : 0;
        int size = 6;
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(direction, sortBy));
//        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<CourseHomeResponse> coursePage;

        coursePage = courseService.searchCoursesSummary(keyword, topicId , pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("courses", coursePage.getContent());
        response.put("currentPage", coursePage.getNumber() + 1);
        response.put("totalItems", coursePage.getTotalElements());
        response.put("totalPages", coursePage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/course/{id}/cert/{userId}")
    public ResponseEntity<?> getCertificate(@PathVariable Long id, @PathVariable Long userId) {
        try {
            CertificateResponse certRes = courseEnrollmentService.getCertificateResponse(id, userId);
            RestResponse<CertificateResponse> response = RestResponse.<CertificateResponse>builder()
                    .statusCode(HttpStatus.OK.value())
                    .message("Certificate fetched successfully")
                    .data(certRes)
                    .build();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/course/{id}")
    public ResponseEntity<RestResponse<CourseDetailPublicResponse>> getCourseDetailPublic(@PathVariable Long id) {
        CourseDetailPublicResponse coursePublicDetail = courseService.getCoursePublicDetail(id);
        RestResponse<CourseDetailPublicResponse> restResponse = RestResponse.<CourseDetailPublicResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Course details fetched successfully")
                .data(coursePublicDetail)
                .build();
        return ResponseEntity.ok().body(restResponse);
    }

}
