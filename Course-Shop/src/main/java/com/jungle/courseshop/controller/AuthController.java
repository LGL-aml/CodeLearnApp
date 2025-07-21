package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.request.*;
import com.jungle.courseshop.dto.response.*;
import com.jungle.courseshop.service.AuthService;
import com.jungle.courseshop.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<RestResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        RestResponse<LoginResponse> apiResponse = new RestResponse<LoginResponse>(HttpStatus.OK.value(), null, "Login successfully", response);
        return ResponseEntity.ok().body(apiResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody LogoutRequest request) throws ParseException {
        authService.logout(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng xuất thành công");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<RestResponse<RegisterResponse>> createUser(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse registerResponse = userService.createUser(request);
        RestResponse<RegisterResponse> response = new RestResponse<>(HttpStatus.CREATED.value(), null, "User registered successfully", registerResponse);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/me")
    public ResponseEntity<UserDetailResponse> getCurrentUser(@RequestBody AccessTokenRequest accessToken) {
        UserDetailResponse userInfo = userService.getCurrentUserInfo(accessToken);
        return ResponseEntity.ok(userInfo);
    }

    @PatchMapping(value="/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UpdateUserResponse> updateUser(@Valid @ModelAttribute UpdateUserRequest request) throws IOException {
        UpdateUserResponse response = userService.updateUserProfile(request);
        return ResponseEntity.ok(response);
    }

}
