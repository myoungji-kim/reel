package com.reel.chat.dto;

public record ChatMessageRequest(
        String content
) {
    // TODO: Phase 4 — @NotBlank validation 추가
}
