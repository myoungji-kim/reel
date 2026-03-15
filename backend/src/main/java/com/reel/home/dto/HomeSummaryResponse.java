package com.reel.home.dto;

import java.util.List;

public record HomeSummaryResponse(
        TodayInfo today,
        StreakInfo streak,
        MonthStats monthStats,
        List<RecentFrame> recentFrames
) {
    public record TodayInfo(
            String date,
            String dayOfWeek,
            boolean hasRecord,
            String mood
    ) {}

    public record StreakInfo(
            int count,
            List<RecentDay> recentDays
    ) {}

    public record RecentDay(
            String date,
            String mood
    ) {}

    public record MonthStats(
            int year,
            int month,
            int frameCount
    ) {}

    public record RecentFrame(
            Long id,
            String title,
            String date,
            String mood,
            int frameNum
    ) {}
}
