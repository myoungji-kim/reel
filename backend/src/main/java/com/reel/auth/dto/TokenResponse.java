package com.reel.auth.dto;

public record TokenResponse(
        String accessToken
) {
    // Refresh Token은 httpOnly 쿠키로 전달
}
