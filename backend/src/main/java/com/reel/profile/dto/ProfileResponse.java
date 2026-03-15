package com.reel.profile.dto;

import java.util.List;

public record ProfileResponse(
        UserInfo user,
        JourneyInfo journey,
        RollsInfo rolls
) {
    public record UserInfo(
            String nickname,
            String avatarUrl,
            String initial,
            String joinedAt,
            String bio
    ) {}

    public record JourneyInfo(
            int totalFrames,
            int completedRolls,
            int bestStreak,
            String topMood,
            List<MoodDist> moodDistribution
    ) {}

    public record MoodDist(String mood, int count, double ratio) {}

    public record RollsInfo(
            ActiveRoll active,
            List<CompletedRoll> completed
    ) {}

    public record ActiveRoll(
            int rollNumber,
            String title,
            int currentFrames,
            int totalFrames,
            int remaining
    ) {}

    public record CompletedRoll(
            int rollNumber,
            String title,
            int frameCount,
            String startDate,
            String endDate
    ) {}
}
