package com.reel.frame.dto;

import jakarta.validation.constraints.NotBlank;

public record SaveFrameRequest(
        @NotBlank String title,
        @NotBlank String content,
        @NotBlank String mood
) {}
