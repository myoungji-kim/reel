package com.reel.frame.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CreateRetrospectiveRequest(
        @Min(2000) int year,
        @Min(1) @Max(12) int month
) {}
