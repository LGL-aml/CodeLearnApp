package com.jungle.courseshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.util.Date;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class InvalidatedToken {
    @Id
    private String id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String token;

    private Date expirationTime;
}
