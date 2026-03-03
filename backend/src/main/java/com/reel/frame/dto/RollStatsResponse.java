package com.reel.frame.dto;

public record RollStatsResponse(
        int currentRollNum,
        int currentRollProgress,
        int rollSize,
        int totalFrames
) {}
