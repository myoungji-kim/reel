package com.reel.frame.dto;

import java.time.LocalDate;

public record OnThisDayResponse(
        Long frameId,
        Integer frameNum,
        String title,
        String mood,
        LocalDate frameDate,
        int yearsAgo
) {}
