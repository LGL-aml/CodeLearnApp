package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.request.LoginRequest;
import com.jungle.courseshop.dto.request.RegisterRequest;
import com.jungle.courseshop.dto.response.LoginResponse;
import com.jungle.courseshop.dto.response.RegisterResponse;
import com.jungle.courseshop.dto.response.RestResponse;
import com.jungle.courseshop.service.AuthService;
import com.jungle.courseshop.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping("/register")
    public ResponseEntity<RestResponse<RegisterResponse>> createUser(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse registerResponse = userService.createUser(request);
        RestResponse<RegisterResponse> response = new RestResponse<>(HttpStatus.CREATED.value(), null, "User registered successfully", registerResponse);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
