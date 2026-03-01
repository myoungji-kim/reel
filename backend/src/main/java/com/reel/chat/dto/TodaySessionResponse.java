package com.reel.chat.dto;

import java.time.LocalDate;
import java.util.List;

public record TodaySessionResponse(
        Long sessionId,
        LocalDate date,
        boolean developed,
        List<ChatMessageResponse> messages
) {}
