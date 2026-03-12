package com.reel.auth.controller;

import com.reel.auth.dto.TokenResponse;
import com.reel.auth.dto.TokenRotationResult;
import com.reel.auth.service.AuthService;
import com.reel.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/refresh
     * Refresh Token(쿠키) → 새 Access Token 발급 + Refresh Token Rotation
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {

        TokenRotationResult result = authService.refresh(refreshToken);

        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString());
        return ResponseEntity.ok(ApiResponse.ok(new TokenResponse(result.accessToken())));
    }

    /**
     * POST /api/auth/logout
     * Redis에서 Refresh Token 삭제 + 쿠키 만료
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {

        authService.logout(refreshToken);

        ResponseCookie expiredCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true).secure(true).sameSite("None")
                .path("/api/auth/refresh").maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie.toString());

        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    private ResponseCookie buildRefreshCookie(String token) {
        return ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(14))
                .build();
    }
}
