package com.reel.frame.dto;

import com.reel.frame.entity.Frame;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record FrameResponse(
        Long id,
        Integer frameNum,
        String title,
        String content,
        String mood,
        String frameType,
        LocalDate date,
        LocalDateTime createdAt,
        List<PhotoResponse> photos,
        boolean isArchived,
        boolean isBookmarked
) {
    public static FrameResponse from(Frame frame) {
        List<PhotoResponse> photos = frame.getPhotos().stream()
                .map(p -> new PhotoResponse(p.getId(), p.getUrl(), p.getOrderNum()))
                .toList();
        return new FrameResponse(
                frame.getId(),
                frame.getFrameNum(),
                frame.getTitle(),
                frame.getContent(),
                frame.getMood(),
                frame.getFrameType() != null ? frame.getFrameType().name() : "DEVELOPED",
                frame.getDate(),
                frame.getCreatedAt(),
                photos,
                frame.isArchived(),
                frame.isBookmarked()
        );
    }
}
