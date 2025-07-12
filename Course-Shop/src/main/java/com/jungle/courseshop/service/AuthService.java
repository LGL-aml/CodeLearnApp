package com.jungle.courseshop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jungle.courseshop.dto.request.LoginRequest;
import com.jungle.courseshop.dto.request.LogoutRequest;
import com.jungle.courseshop.dto.request.RefreshTokenRequest;
import com.jungle.courseshop.dto.response.LoginResponse;
import com.jungle.courseshop.dto.response.RefreshTokenResponse;
import com.jungle.courseshop.entity.InvalidatedToken;
import com.jungle.courseshop.entity.User;
import com.jungle.courseshop.repository.InvalidTokenRepo;
import com.jungle.courseshop.repository.UserRepo;
import com.nimbusds.jwt.SignedJWT;
import io.micrometer.common.util.StringUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final InvalidTokenRepo invalidatedTokenRepository;
    private final UserRepo userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        try{
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            User user = (User) authentication.getPrincipal();

            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();
        }catch (BadCredentialsException e) {
            throw e;
        }
    }

    public void logout(LogoutRequest request) throws ParseException {
        // 1. Kiểm tra xem token đó có phải là token của hệ thống mình sản xuất ra hay không
        SignedJWT signedJWT = SignedJWT.parse(request.getAccessToken());

        // 2. Đánh dấu token đó hết hiệu lực, và không có quyền truy cập vào hệ thống nữa, dù cho thời gian token còn hiệu lực
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(signedJWT.getJWTClaimsSet().getJWTID())
                .token(request.getAccessToken())
                .expirationTime(signedJWT.getJWTClaimsSet().getExpirationTime())
                .build();
        // 3. Lưu token vào data, từ lần sau kiểm tra token người dùng gửi có trong database hay không
        invalidatedTokenRepository.save(invalidatedToken);
        log.info("Logout successfully");
    }

    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) throws ParseException {
        if(StringUtils.isBlank(request.getRefreshToken()))
            throw new RuntimeException("Token cannot be blank");

        SignedJWT signedJWT = SignedJWT.parse(request.getRefreshToken());

        if(signedJWT.getJWTClaimsSet().getExpirationTime().before(new Date()))
            throw new RuntimeException("Token expired time");

        Optional<InvalidatedToken> invalidatedToken = invalidatedTokenRepository.findById(signedJWT.getJWTClaimsSet().getJWTID());
        if(invalidatedToken.isPresent())
            throw new RuntimeException("Token expired time");

        String username = signedJWT.getJWTClaimsSet().getSubject();

        User user = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);

        return RefreshTokenResponse.builder()
                .accessToken(accessToken)
                .build();
    }

}
