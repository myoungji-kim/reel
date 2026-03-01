package com.reel.auth.dto;

public record TokenRotationResult(
        String accessToken,
        String refreshToken
) {}
