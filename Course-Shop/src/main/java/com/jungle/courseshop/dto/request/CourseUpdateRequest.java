package com.jungle.courseshop.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CourseUpdateRequest {
    private String title;
    private String description;
    private String content;
    private Integer duration;
    private MultipartFile coverImage; // Có thể null nếu không update ảnh
    private Long topicId;
    private String modules; // JSON list các module và video mới
}
