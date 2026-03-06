package com.reel.frame.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record SaveFrameRequest(
        @NotBlank String title,
        @NotBlank String content,
        @NotBlank String mood,
        LocalDate date
) {}
