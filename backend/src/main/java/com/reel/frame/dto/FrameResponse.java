package com.reel.frame.dto;

import com.reel.frame.entity.Frame;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FrameResponse(
        Long id,
        Integer frameNum,
        String title,
        String content,
        String mood,
        LocalDate date,
        LocalDateTime createdAt
) {
    public static FrameResponse from(Frame frame) {
        return new FrameResponse(
                frame.getId(),
                frame.getFrameNum(),
                frame.getTitle(),
                frame.getContent(),
                frame.getMood(),
                frame.getDate(),
                frame.getCreatedAt()
        );
    }
}
