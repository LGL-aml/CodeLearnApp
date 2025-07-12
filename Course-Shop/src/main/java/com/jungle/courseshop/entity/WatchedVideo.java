package com.jungle.courseshop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchedVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private CourseVideo video;

    @Column(nullable = false)
    private LocalDateTime watchedAt;

    @Column(nullable = false)
    private Boolean watched;

    @PrePersist
    protected void onCreate() {
        watchedAt = LocalDateTime.now();
    }
}
