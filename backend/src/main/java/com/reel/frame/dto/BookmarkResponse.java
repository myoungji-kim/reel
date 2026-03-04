package com.reel.frame.dto;

public record BookmarkResponse(
        Long frameId,
        boolean isBookmarked
) {}
