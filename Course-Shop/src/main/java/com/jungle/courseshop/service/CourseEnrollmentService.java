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

        if (enrollment.getProgress() >= 100.0 && enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            // Nếu đã hoàn thành, không cập nhật progress lại nữa
            return;
        }

        long totalVideos = videoCourseRepository.countByCourseModule_Course(course);
        long watchedVideos = watchedVideoRepository.countByUserAndVideo_CourseModule_Course_AndWatchedTrue(user, course);

        if (totalVideos == 0) throw new RuntimeException("Khóa học này không có video nào");

        double progress = (watchedVideos * 100.0) / totalVideos;

        enrollment.setProgress(progress);

        if (progress >= 100.0) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletionDate(LocalDateTime.now());
            emailService.sendCourseCompletionEmail(user.getEmail(),
                    user.getFullname(),
                    course.getTitle(),
                    course.getDuration(),
                    course.getCreator().getFullname(),
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            // Tạo chứng chỉ nếu chưa có
            if (!certificateRepository.existsByUserAndCourse(user, course)) {
                Certificate certificate = new Certificate();
                certificate.setUser(user);
                certificate.setCourse(course);
                certificate.setIssuedDate(LocalDateTime.now());
                certificateRepository.save(certificate);
            }
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

}
