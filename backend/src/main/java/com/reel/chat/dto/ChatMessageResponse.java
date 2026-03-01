package com.reel.chat.dto;

import java.time.OffsetDateTime;

public record ChatMessageResponse(
        Long id,
        String role,
        String content,
        OffsetDateTime createdAt
) {}
