package com.jungle.courseshop.service;


import com.jungle.courseshop.dto.request.AccessTokenRequest;
import com.jungle.courseshop.dto.request.RegisterRequest;
import com.jungle.courseshop.dto.request.UpdateUserRequest;
import com.jungle.courseshop.dto.response.RegisterResponse;
import com.jungle.courseshop.dto.response.UpdateUserResponse;
import com.jungle.courseshop.dto.response.UserDetailResponse;
import com.jungle.courseshop.entity.Role;
import com.jungle.courseshop.entity.User;
import com.jungle.courseshop.repository.UserRepo;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> byEmail = userRepo.findByEmail(request.getEmail());
        Optional<User> byUsername = userRepo.findByUsernameAndEnabledTrue(request.getUsername());
        if(byEmail.isPresent()) {
            throw new RuntimeException("Email existed");
        }
        if (byUsername.isPresent()) {
            throw new RuntimeException("Username existed");
        }

        String imgUser = "https://freesvg.org/img/abstract-user-flat-3.png";

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));

        Role assignedRole = Role.MEMBER;
        if (isAdmin && request.getRole() != null) {
            assignedRole = request.getRole();
        }else {
            if (request.getRole() != null) {
                throw new RuntimeException("Bạn không có quyền gán vai trò này");
            }
        }

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
                .role(assignedRole)
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

    public UserDetailResponse getCurrentUserInfo(AccessTokenRequest accessToken) {
        String token = accessToken.getAccessToken();

        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Access token is missing");
        }

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        String username = jwtService.getUsernameFromToken(token);
        return userRepo.findByUsernameAndEnabledTrue(username)
                .map(user -> {
                    return UserDetailResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .fullName(user.getFullname())
                            .gender(user.getGender())
                            .yob(user.getYob())
                            .avatar(user.getAvatar())
                            .address(user.getAddress())
                            .role(user.getRole().name())
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<UserDetailResponse> getAllUsers() {
        List<User> users = userRepo.findAllByEnabled(true);
        return users.stream().map(this::mapToUserDetailResponse).collect(Collectors.toList());
    }

    public UserDetailResponse getUsersById(Long userId) {
        User user = userRepo.findByIdAndEnabledTrue(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + userId));
        return mapToUserDetailResponse(user);
    }

    public UpdateUserResponse updateUserProfile(UpdateUserRequest request) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepo.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username: " + username));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail()) &&
                userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (request.getFullname() != null) {
            user.setFullname(request.getFullname());
        }

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(request.getAvatar());
            user.setAvatar(imageUrl);
        }

        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getYob() != null) {
            user.setYob(request.getYob());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (request.getRole() != null) {
            if (isAdmin) {
                user.setRole(request.getRole());
            } else {
                throw new RuntimeException("Bạn không có quyền thay đổi vai trò người dùng");
            }
        }

        User updatedUser = userRepo.save(user);
        log.info("Admin updated user: {}", updatedUser.getUsername());

        return UpdateUserResponse.builder()
                .username(updatedUser.getUsername())
                .fullname(updatedUser.getFullname())
                .avatar(updatedUser.getAvatar())
                .yob(updatedUser.getYob())
                .gender(updatedUser.getGender())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .address(updatedUser.getAddress())
                .role(updatedUser.getRole())
                .message("Cập nhật người dùng thành công")
                .build();
    }

    @Transactional
    public UpdateUserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + userId));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail()) &&
                userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (request.getFullname() != null) {
            user.setFullname(request.getFullname());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }


        User updatedUser = userRepo.save(user);

        log.info("Admin updated user: {}", updatedUser.getUsername());

        return UpdateUserResponse.builder()

                .id(updatedUser.getId())
                .username(updatedUser.getUsername())
                .fullname(updatedUser.getFullname())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .address(updatedUser.getAddress())
                .role(updatedUser.getRole())
                .message("Cập nhật người dùng thành công")
                .build();
    }

    public void deleteUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + userId));

        if(user.isEnabled()){
            user.setEnabled(false);
        }
        userRepo.save(user);

        log.info("Admin deleted user: {} with ID: {}", user.getUsername(), userId);
    }

    private UserDetailResponse mapToUserDetailResponse(User user) {
        return UserDetailResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullname())
                .yob(user.getYob())
                .gender(user.getGender())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole().name())
                .build();
    }

}
