package com.reel.frame.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record QuickFrameRequest(
        @NotBlank String title,
        @NotBlank String content,
        LocalDate date,
        @NotBlank String mood
) {}
