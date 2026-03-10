package com.reel.user.dto;

import java.time.LocalDate;

public record StreakResponse(
        int streakCount,
        LocalDate lastFrameDate,
        boolean recordedToday
) {}
