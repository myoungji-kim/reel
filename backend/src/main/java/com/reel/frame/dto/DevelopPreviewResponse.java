package com.reel.frame.dto;

public record DevelopPreviewResponse(
        String title,
        String content
) {
    // AI가 생성한 일기 미리보기 (아직 저장 전)
}
