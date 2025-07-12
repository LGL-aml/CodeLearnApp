package com.jungle.courseshop.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.jungle.courseshop.entity.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentResponse {
    private Long courseId;
    private String courseTitle;
    private String username;
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime enrollmentDate;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime completionDate;
    private EnrollmentStatus status;
    private Double progress;
}
