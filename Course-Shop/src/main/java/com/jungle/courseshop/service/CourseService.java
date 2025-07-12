package com.jungle.courseshop.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jungle.courseshop.dto.request.CourseCreateRequest;
import com.jungle.courseshop.dto.request.CourseModuleRequest;
import com.jungle.courseshop.dto.request.CourseUpdateRequest;
import com.jungle.courseshop.dto.response.*;
import com.jungle.courseshop.entity.*;
import com.jungle.courseshop.exception.ResourceNotFoundException;
import com.jungle.courseshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {
    private final UserRepo userRepository;
    private final CourseRepo courseRepository;
    private final CourseModuleRepo moduleRepository;
    private final CourseEnrollmentRepo enrollmentRepository;
    private final CloudinaryService cloudinaryService;
    private final WatchedVideoRepo watchedVideoRepository;
    private final ObjectMapper objectMapper;
    private final TopicRepo topicRepo;


    @Transactional
    public CourseResponse createCourse(CourseCreateRequest request) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != Role.LECTURER) {
            throw new AccessDeniedException("Only Lecturer can create courses");
        }


        Topic topic = topicRepo.findByIdAndActive(request.getTopicId(), true);
        if(topic == null) {
            throw new ResourceNotFoundException("Topic not found with ID: " + request.getTopicId());
        }
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setTopic(topic);
        course.setDescription(request.getDescription());
        course.setContent(request.getContent());
        course.setDuration(request.getDuration());
        course.setActive(true);
        course.setCreator(currentUser);
        course.setStatus(ApprovalStatus.PENDING);

        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(request.getCoverImage());
            course.setCoverImage(imageUrl);
        }

        Course savedCourse = courseRepository.save(course);
        log.info("Course created: {}", savedCourse.getTitle());

        // Create modules if provided
        List<CourseModule> modules = new ArrayList<>();


        if (StringUtils.hasText(request.getModules())) {
            List<CourseModuleRequest> moduleRequests = objectMapper.readValue(
                    request.getModules(), new TypeReference<>() {});

            for (CourseModuleRequest moduleRequest : moduleRequests) {
                CourseModule module = new CourseModule();
                module.setTitle(moduleRequest.getTitle());
                module.setOrderIndex(moduleRequest.getOrderIndex());
                module.setCourse(savedCourse);

                List<CourseVideo> videos = new ArrayList<>();
                if (moduleRequest.getVideos() != null) {
                    for (CourseModuleRequest.VideoCourseRequest url : moduleRequest.getVideos()) {
                        CourseVideo video = new CourseVideo();
                        video.setTitle(url.getTitle());
                        video.setVideoUrl(url.getVideoUrl());
                        video.setCourseModule(module);
                        videos.add(video);
                    }
                }
                module.setVideos(videos);
                modules.add(module);
            }
            moduleRepository.saveAll(modules);
        }

        return mapToCourseResponse(savedCourse, modules, currentUser);
    }



    @Transactional
    public CourseResponse updateCourse(Long id, CourseUpdateRequest request) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Chỉ cho phép LECTURER là creator update course
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        if (currentUser.getRole() != Role.LECTURER || !java.util.Objects.equals(course.getCreator().getId(), currentUser.getId())) {
            throw new AccessDeniedException("Only the creator lecturer can update this course");
        }

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getContent() != null) course.setContent(request.getContent());
        if (request.getDuration() != null) course.setDuration(request.getDuration());
        if (request.getTopicId() != null) {
            Topic topic = topicRepo.findByIdAndActive(request.getTopicId(), true);
            if (topic == null) {
                throw new ResourceNotFoundException("Topic not found with ID: " + request.getTopicId());
            }
            course.setTopic(topic);
        }
        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(request.getCoverImage());
            course.setCoverImage(imageUrl);
        }
        // Khi update, status về PENDING để duyệt lại
        course.setStatus(ApprovalStatus.PENDING);

        // Xử lý cập nhật modules và videos nếu có
        if (request.getModules() != null) {
            // Xóa toàn bộ module và video cũ
            List<CourseModule> oldModules = moduleRepository.findByCourse_ActiveTrueOrderByOrderIndexAsc()
                .stream().filter(m -> m.getCourse().getId().equals(course.getId())).toList();
            moduleRepository.deleteAll(oldModules);

            // Tạo lại module và video mới
            List<CourseModuleRequest> moduleRequests = objectMapper.readValue(
                    request.getModules(), new TypeReference<>() {});
            List<CourseModule> newModules = new ArrayList<>();
            for (CourseModuleRequest moduleRequest : moduleRequests) {
                CourseModule module = new CourseModule();
                module.setTitle(moduleRequest.getTitle());
                module.setOrderIndex(moduleRequest.getOrderIndex());
                module.setCourse(course);
                List<CourseVideo> videos = new ArrayList<>();
                if (moduleRequest.getVideos() != null) {
                    for (CourseModuleRequest.VideoCourseRequest url : moduleRequest.getVideos()) {
                        CourseVideo video = new CourseVideo();
                        video.setTitle(url.getTitle());
                        video.setVideoUrl(url.getVideoUrl());
                        video.setCourseModule(module);
                        videos.add(video);
                    }
                }
                module.setVideos(videos);
                newModules.add(module);
            }
            moduleRepository.saveAll(newModules);
        }

        Course savedCourse = courseRepository.save(course);
        // Lấy lại modules để trả về response
        List<CourseModule> modules = moduleRepository.findByCourse_ActiveTrueOrderByOrderIndexAsc();
        return mapToCourseResponse(savedCourse, modules, currentUser);
    }

    @Transactional
    public void softDeleteCourse(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        if (currentUser.getRole() != Role.LECTURER || !java.util.Objects.equals(course.getCreator().getId(), currentUser.getId())) {
            throw new AccessDeniedException("Only the creator lecturer can delete this course");
        }
        course.setActive(false);
        courseRepository.save(course);
    }

    public Page<CourseHomeResponse> searchCoursesSummary(String keyword, Long topicId, Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        Page<Course> courses = courseRepository.searchCourses(keyword, topicId, pageable);
        return courses.map(course -> {
            boolean isEnrolled = false;
            if (currentUser != null) {
                isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
            }
            return mapToCourseHomeResponse(course, isEnrolled);
        });
    }

    public List<CourseHomeResponse> getLastestCourses() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username).orElse(null);

        List<Course> courses = courseRepository.findTop3ByStatusAndActiveTrueOrderByCreatedAtDesc(ApprovalStatus.APPROVED);


        return courses.stream()
                .map(course -> {
                    List<CourseModule> modules = moduleRepository.findByCourse_ActiveTrueAndCourse_StatusOrderByOrderIndexAsc(ApprovalStatus.APPROVED);
                    boolean isEnrolled = false;
                    if (currentUser != null) {
                        isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
                    }
                    return CourseHomeResponse.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .coverImage(course.getCoverImage())
                            .summary(course.getDescription())
                            .createdAt(course.getCreatedAt())
                            .topicName(course.getTopic() != null ? course.getTopic().getName() : null)
                            .creatorName(course.getCreator().getFullname())
                            .duration(course.getDuration())
                            .isEnrolled(isEnrolled)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public CourseDetailPublicResponse getCoursePublicDetail(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username).orElse(null);

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        Optional<CourseEnrollment> enrollmentOpt =
                enrollmentRepository.findByUserAndCourse(currentUser, course);

        EnrollmentStatus enrollmentStatus = EnrollmentStatus.NOT_ENROLLED;

        if (enrollmentOpt.isPresent()) {
            enrollmentStatus = enrollmentOpt.get().getStatus();
        }

        List<CourseModule> modules = moduleRepository.findByCourse_ActiveTrueAndCourse_StatusOrderByOrderIndexAsc(ApprovalStatus.APPROVED);
        long enrollmentCount = enrollmentRepository.countByCourse(course);

        return CourseDetailPublicResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .topicName(course.getTopic().getName())
                .content(course.getContent())
                .coverImage(course.getCoverImage())
                .duration(course.getDuration())
                .createdBy(course.getCreator() != null ? course.getCreator().getFullname() : "Unknown")
                .videoCount(modules.stream().mapToInt(m -> m.getVideos().size()).sum())
                .totalEnrolled(enrollmentCount)
                .status(enrollmentStatus)
                .modules(modules.stream()
                        .map(m -> CourseDetailPublicResponse.ModuleInfo.builder()
                                .id(m.getId())
                                .title(m.getTitle())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    public List<CourseResponse> getCoursesByLecturer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (currentUser.getRole() != Role.LECTURER) {
            throw new AccessDeniedException("Only lecturer can view their courses");
        }
        List<Course> courses = courseRepository.findByCreatorAndActiveTrue(currentUser);
        List<CourseResponse> responses = new ArrayList<>();
        for (Course course : courses) {
            List<CourseModule> modules = moduleRepository.findByCourse_ActiveTrueOrderByOrderIndexAsc()
                .stream().filter(m -> m.getCourse().getId().equals(course.getId())).toList();
            responses.add(mapToCourseResponse(course, modules, currentUser));
        }
        return responses;
    }

    private CourseResponse mapToCourseResponse(Course course, List<CourseModule> modules, User currentUser) {
        List<CourseModuleResponse> moduleResponses = modules.stream()
                .map(m -> mapToModuleResponse(m, currentUser))
                .collect(Collectors.toList());

        EnrollmentStatus enrollmentStatus = EnrollmentStatus.NOT_ENROLLED;
        double progress = 0.0;
        if (currentUser != null) {
            Optional<CourseEnrollment> enrollmentOpt = enrollmentRepository.findByUserAndCourse(currentUser, course);
            if (enrollmentOpt.isPresent()) {
                enrollmentStatus = enrollmentOpt.get().getStatus();
                progress = enrollmentOpt.get().getProgress() != null ? enrollmentOpt.get().getProgress() : 0.0;
            }
        }


        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .content(course.getContent())
                .coverImage(course.getCoverImage())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .creator(course.getCreator().getFullname())
                .modules(moduleResponses)
                .enrollmentCount(course.getEnrolledCount())
                .enrollmentStatus(enrollmentStatus)
                .progress(progress)
                .build();
    }

    private CourseModuleResponse mapToModuleResponse(CourseModule module, User currentUser) {
        List<VideoCourseResponse> videoDTOs = module.getVideos().stream()
                .map(video -> {
                    boolean watched = watchedVideoRepository.existsByUserAndVideoAndWatchedTrue(currentUser, video);
                    return VideoCourseResponse.builder()
                            .id(video.getId())
                            .title(video.getTitle())
                            .videoUrl(video.getVideoUrl())
                            .watched(watched)
                            .build();
                })
                .collect(Collectors.toList());
        return CourseModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .videos(videoDTOs)
                .orderIndex(module.getOrderIndex())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }

    private CourseHomeResponse mapToCourseHomeResponse(Course course, boolean isEnrolled) {
        CourseHomeResponse dto = new CourseHomeResponse();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setSummary(course.getDescription());
        dto.setCoverImage(course.getCoverImage());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setTopicName(course.getTopic() != null ? course.getTopic().getName() : null);
        dto.setCreatorName(course.getCreator().getFullname());
        dto.setDuration(course.getDuration());
        dto.setEnrolled(isEnrolled);
        return dto;
    }

}
