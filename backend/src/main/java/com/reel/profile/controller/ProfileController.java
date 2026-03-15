package com.reel.profile.controller;

import com.reel.common.response.ApiResponse;
import com.reel.profile.dto.ProfileResponse;
import com.reel.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getProfile(userId)));
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            @AuthenticationPrincipal Long userId,
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
        profileService.withdraw(userId, refreshToken);
        // Refresh Token 쿠키 즉시 만료
        ResponseCookie expiredCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true).secure(true).sameSite("None")
                .path("/api/auth/refresh").maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie.toString());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
