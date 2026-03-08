package com.reel.frame.dto;

import java.time.LocalDate;

public record CalendarFrameResponse(
        Long frameId,
        LocalDate date,
        String mood
) {}
