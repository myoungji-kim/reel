package com.reel.home.service;

import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.frame.entity.Frame;
import com.reel.frame.repository.FrameRepository;
import com.reel.home.dto.HomeSummaryResponse;
import com.reel.home.dto.HomeSummaryResponse.*;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {

    private final UserRepository userRepository;
    private final FrameRepository frameRepository;

    public HomeSummaryResponse getSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ReelException(ErrorCode.USER_NOT_FOUND));

        LocalDate today = LocalDate.now();

        // === 최근 7일 프레임 조회 (recentDays + today 정보) ===
        LocalDate sevenDaysAgo = today.minusDays(6);
        List<Frame> recentFrames7 = frameRepository.findByUserIdAndDateBetween(userId, sevenDaysAgo, today);

        // 날짜별 mood 매핑 (같은 날 여러 프레임이면 가장 최신 것 사용)
        Map<LocalDate, String> moodByDate = recentFrames7.stream()
                .collect(Collectors.toMap(
                        Frame::getDate,
                        f -> f.getMood() != null ? f.getMood() : "",
                        (existing, replacement) -> existing  // 먼저 온 것(createdAt desc 정렬이라 최신) 유지
                ));

        // today info
        String todayMood = moodByDate.getOrDefault(today, null);
        boolean hasRecord = moodByDate.containsKey(today);
        String dayOfWeek = today.getDayOfWeek()
                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                .toUpperCase();

        TodayInfo todayInfo = new TodayInfo(
                today.toString(),
                dayOfWeek,
                hasRecord,
                (todayMood != null && !todayMood.isEmpty()) ? todayMood : null
        );

        // recentDays: 오늘 포함 7일, 오래된 순
        List<RecentDay> recentDays = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String mood = moodByDate.getOrDefault(d, null);
            recentDays.add(new RecentDay(
                    d.toString(),
                    (mood != null && !mood.isEmpty()) ? mood : null
            ));
        }

        StreakInfo streakInfo = new StreakInfo(user.getStreakCount(), recentDays);

        // === 이번 달 프레임 수 ===
        int frameCount = frameRepository.countByUserIdAndYearAndMonth(userId, today.getYear(), today.getMonthValue());
        MonthStats monthStats = new MonthStats(today.getYear(), today.getMonthValue(), frameCount);

        // === 최근 5개 프레임 ===
        var page = frameRepository.findByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 5));
        List<HomeSummaryResponse.RecentFrame> recentFrameList = page.getContent().stream()
                .map(f -> new HomeSummaryResponse.RecentFrame(
                        f.getId(),
                        f.getTitle(),
                        f.getDate().toString(),
                        f.getMood(),
                        f.getFrameNum()
                ))
                .toList();

        return new HomeSummaryResponse(todayInfo, streakInfo, monthStats, recentFrameList);
    }
}
