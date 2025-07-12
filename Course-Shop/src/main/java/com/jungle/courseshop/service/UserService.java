package com.jungle.courseshop.service;


import com.jungle.courseshop.dto.request.RegisterRequest;
import com.jungle.courseshop.dto.response.RegisterResponse;
import com.jungle.courseshop.entity.Role;
import com.jungle.courseshop.entity.User;
import com.jungle.courseshop.repository.UserRepo;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService mailService;
    private final CloudinaryService cloudinaryService;
    private final JwtService jwtService;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.email}")
    private String adminEmail;

    @Override
    public void run(String... args) throws Exception {
        createAdminUserIfNotExists();
    }

    private void createAdminUserIfNotExists() {
        if (userRepo.findByUsernameAndEnabledTrue(adminUsername).isEmpty() &&
                userRepo.findByEmail(adminEmail).isEmpty()) {
            log.info("Creating admin user: {}", adminUsername);

            User adminUser = User.builder()
                    .username(adminUsername)
                    .fullname("Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();

            userRepo.save(adminUser);
            log.info("Admin user created successfully");
        } else {
            log.info("Admin user already exists, skipping creation");
        }
    }

    public RegisterResponse createUser(RegisterRequest request) {
        Optional<User> byEmail = userRepo.findByEmail(request.getEmail());
        Optional<User> byUsername = userRepo.findByUsernameAndEnabledTrue(request.getUsername());
        if(byEmail.isPresent()) {
            throw new RuntimeException("Email existed");
        }
        if (byUsername.isPresent()) {
            throw new RuntimeException("Username existed");
        }

        String imgUser = "https://freesvg.org/img/abstract-user-flat-3.png";

        User user = User.builder()
                .username(request.getUsername())
                .fullname(request.getFullname())
                .gender(request.getGender())
                .yob(request.getYob())
                .email(request.getEmail())
                .avatar(imgUser)
                .phone(request.getPhone())
                .address(request.getAddress())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.MEMBER)
                .enabled(true)
                .build();

        userRepo.save(user);

        try {
            mailService.sendWelcomeEmail(user.getEmail(), user.getFullname());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("SendEmail failed with email: {}", user.getEmail());
            throw new RuntimeException(e);
        }

        return RegisterResponse.builder()
                .username(user.getUsername())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }

}
