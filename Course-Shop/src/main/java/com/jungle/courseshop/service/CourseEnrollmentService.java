package com.jungle.courseshop.service;


import com.jungle.courseshop.dto.response.*;
import com.jungle.courseshop.entity.*;
import com.jungle.courseshop.repository.*;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseEnrollmentService {

    private final CourseRepo courseRepository;
    private final CourseModuleRepo moduleRepository;
    private final CourseEnrollmentRepo enrollmentRepository;
    private final UserRepo userRepository;
    private final EmailService emailService;
    private final WatchedVideoRepo watchedVideoRepository;
    private final CourseVideoRepo videoCourseRepository;
    private final CertificateRepo certificateRepository;

    @Transactional
    public CourseEnrollmentResponse enrollCourse(Long courseId) throws MessagingException, UnsupportedEncodingException, MessagingException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));


        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));


        // Check if user is already enrolled
        if (enrollmentRepository.existsByUserAndCourse(currentUser, course)) {
            throw new RuntimeException("User already enrolled in this course");
        }

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setUser(currentUser);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setProgress(0.0);

        long enrollmentCount = enrollmentRepository.countByCourse(course);
        course.setEnrolledCount(enrollmentCount);
        courseRepository.save(course);

        CourseEnrollment savedEnrollment = enrollmentRepository.save(enrollment);

        emailService.sendEnrollmentSuccessEmail(
                currentUser.getEmail(),
                currentUser.getFullname(),
                course.getTitle(),
                course.getDuration(),
                course.getCreator().getFullname(),
                LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        );

        log.info("User {} enrolled in course: {}", currentUser.getUsername(), course.getTitle());

        return mapToEnrollmentResponse(savedEnrollment);
    }

    public List<CourseEnrollmentResponse> getEnrolledCourses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));


        List<CourseEnrollment> enrollments = enrollmentRepository.findByUser(currentUser);

        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }


    //check watched videos
    public void markVideoAsWatched(Long videoId, boolean watchedStatus) throws MessagingException, UnsupportedEncodingException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CourseVideo video = videoCourseRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        Optional<WatchedVideo> optionalWatched = watchedVideoRepository.findByUserAndVideo(user, video);

        if (watchedStatus) {
            // Nếu chưa có thì tạo mới
            WatchedVideo watchedVideo = optionalWatched.orElseGet(() -> {
                WatchedVideo w = new WatchedVideo();
                w.setUser(user);
                w.setVideo(video);
                return w;
            });
            watchedVideo.setWatched(true);
            watchedVideoRepository.save(watchedVideo);
        } else {
            optionalWatched.ifPresent(w -> {
                w.setWatched(false);
                watchedVideoRepository.save(w);
            });
        }

        // Tính progress
        Course course = video.getCourseModule().getCourse();
        CourseEnrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("You are not enrolled in this course"));

        long totalVideos = videoCourseRepository.countByCourseModule_Course(course);
        long watchedVideos = watchedVideoRepository.countByUserAndVideo_CourseModule_Course_AndWatchedTrue(user, course);

        if (totalVideos == 0) throw new RuntimeException("Khóa học này không có video nào");

        double progress = (watchedVideos * 100.0) / totalVideos;

        enrollment.setProgress(progress);

        if (progress >= 100.0) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletionDate(LocalDateTime.now());
            // Tạo chứng chỉ nếu chưa có
            if (!certificateRepository.existsByUserAndCourse(user, course)) {
                Certificate certificate = new Certificate();
                certificate.setUser(user);
                certificate.setCourse(course);
                certificate.setIssuedDate(LocalDateTime.now());
                certificateRepository.save(certificate);
            }
        } else {
            enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);
        }

        enrollmentRepository.save(enrollment);
    }


    public CertificateResponse getCertificateResponse(Long courseId, Long userId) {
        Certificate cert = certificateRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        return CertificateResponse.builder()
                .courseTitle(cert.getCourse().getTitle())
                .username(cert.getUser().getFullname())
                .build();
    }

    private CourseEnrollmentResponse mapToEnrollmentResponse(CourseEnrollment enrollment) {
        return CourseEnrollmentResponse.builder()
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .username(enrollment.getUser().getUsername())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .completionDate(enrollment.getCompletionDate())
                .status(enrollment.getStatus())
                .progress(enrollment.getProgress())
                .build();
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
}
