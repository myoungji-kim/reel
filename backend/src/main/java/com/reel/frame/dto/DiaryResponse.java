package com.reel.frame.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record DiaryResponse(
        Long id,
        Integer frameNum,
        String title,
        String content,
        String mood,
        LocalDate diaryDate,
        OffsetDateTime createdAt
) {}
