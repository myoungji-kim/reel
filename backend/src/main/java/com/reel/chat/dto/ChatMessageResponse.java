package com.reel.chat.dto;

import com.reel.chat.entity.ChatMessage;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        String role,
        String content,
        LocalDateTime createdAt,
        String suggestText   // null if no suggest, non-null when AI appended ---SUGGEST---
) {
    public static ChatMessageResponse from(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole().name(),
                message.getContent(),
                message.getCreatedAt(),
                null
        );
    }

    public static ChatMessageResponse withSuggest(ChatMessage message, String suggestText) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole().name(),
                message.getContent(),
                message.getCreatedAt(),
                suggestText
        );
    }
}
