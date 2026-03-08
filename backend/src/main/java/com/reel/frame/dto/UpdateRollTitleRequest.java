package com.reel.frame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateRollTitleRequest(
        @NotBlank
        @Size(max = 100)
        String title
) {}
