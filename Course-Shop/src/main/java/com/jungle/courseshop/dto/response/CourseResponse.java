package com.jungle.courseshop.dto.response;

import com.jungle.courseshop.entity.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String coverImage;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String creator;
    private List<CourseModuleResponse> modules;
    private Long enrollmentCount;
    private EnrollmentStatus enrollmentStatus;
    private double progress;
}
