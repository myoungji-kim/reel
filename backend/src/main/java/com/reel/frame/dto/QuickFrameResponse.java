package com.reel.frame.dto;

public record QuickFrameResponse(
        Long frameId,
        Integer frameNum,
        String title,
        String frameType
) {}
