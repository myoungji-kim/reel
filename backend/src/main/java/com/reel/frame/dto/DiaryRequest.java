package com.reel.frame.dto;

public record DiaryRequest(
        Long sessionId,
        String title,
        String content,
        String mood
) {
    // TODO: Phase 5 — @NotBlank validation 추가
}
