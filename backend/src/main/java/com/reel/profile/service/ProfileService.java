package com.reel.profile.service;

import com.reel.auth.jwt.JwtTokenProvider;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.frame.entity.Frame;
import com.reel.frame.entity.Roll;
import com.reel.frame.repository.FramePhotoRepository;
import com.reel.frame.repository.FrameRepository;
import com.reel.frame.repository.RollRepository;
import com.reel.chat.repository.ChatMessageRepository;
import com.reel.chat.repository.ChatSessionRepository;
import com.reel.profile.dto.ProfileResponse;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {

    private final UserRepository userRepository;
    private final FrameRepository frameRepository;
    private final FramePhotoRepository framePhotoRepository;
    private final RollRepository rollRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ReelException(ErrorCode.USER_NOT_FOUND));

        // ── UserInfo ────────────────────────────────────────────────────────
        String nickname = user.getNickname() != null ? user.getNickname() : "reel user";
        String initial = nickname.isEmpty() ? "R" : String.valueOf(nickname.charAt(0)).toUpperCase();
        String joinedAt = user.getCreatedAt().toLocalDate().toString(); // "2025-11-11"
        String bio = user.getBio() != null ? user.getBio() : "";

        ProfileResponse.UserInfo userInfo = new ProfileResponse.UserInfo(
                nickname, user.getProfileImg(), initial, joinedAt, bio
        );

        // ── JourneyInfo ─────────────────────────────────────────────────────
        int totalFrames = (int) frameRepository.countByUserId(userId);
        int completedRolls = totalFrames / 24;
        int bestStreak = user.getBestStreak();

        List<Frame> allFrames = frameRepository.findAllByUserIdNotArchived(userId);
        Map<String, Long> moodCount = allFrames.stream()
                .filter(f -> f.getMood() != null && !f.getMood().isBlank())
                .collect(Collectors.groupingBy(Frame::getMood, Collectors.counting()));

        long moodTotal = moodCount.values().stream().mapToLong(Long::longValue).sum();
        List<ProfileResponse.MoodDist> moodDistribution = moodCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new ProfileResponse.MoodDist(
                        e.getKey(),
                        e.getValue().intValue(),
                        moodTotal > 0 ? (double) e.getValue() / moodTotal : 0.0
                ))
                .collect(Collectors.toList());

        String topMood = moodDistribution.isEmpty() ? null : moodDistribution.get(0).mood();

        ProfileResponse.JourneyInfo journeyInfo = new ProfileResponse.JourneyInfo(
                totalFrames, completedRolls, bestStreak, topMood, moodDistribution
        );

        // ── RollsInfo ───────────────────────────────────────────────────────
        int activeRollNum = completedRolls + 1;
        int currentFrames = totalFrames % 24;
        if (currentFrames == 0 && totalFrames > 0) currentFrames = 24; // 방금 완성된 롤
        int remaining = 24 - (currentFrames == 24 ? 0 : currentFrames);

        // 진행 중인 롤 제목 조회
        String activeTitle = rollRepository.findByUserIdAndRollNum(userId, activeRollNum)
                .map(Roll::getTitle)
                .orElse(null);

        ProfileResponse.ActiveRoll activeRoll = new ProfileResponse.ActiveRoll(
                activeRollNum, activeTitle,
                currentFrames == 24 ? 0 : currentFrames,
                24,
                currentFrames == 24 ? 24 : remaining
        );

        // 완성된 롤 목록
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");
        List<ProfileResponse.CompletedRoll> completedRollList = rollRepository
                .findByUserIdOrderByRollNumAsc(userId).stream()
                .map(roll -> {
                    int startNum = (roll.getRollNum() - 1) * 24 + 1;
                    int endNum = roll.getRollNum() * 24;
                    List<LocalDate> dates = frameRepository.findDatesByRollNum(userId, startNum, endNum);
                    String startDate = dates.stream().min(Comparator.naturalOrder())
                            .map(d -> d.format(monthFmt)).orElse("");
                    String endDate = dates.stream().max(Comparator.naturalOrder())
                            .map(d -> d.format(monthFmt)).orElse("");
                    String rollTitle = roll.getTitle() != null ? roll.getTitle()
                            : "ROLL " + String.format("%02d", roll.getRollNum());
                    return new ProfileResponse.CompletedRoll(
                            roll.getRollNum(), rollTitle, endNum - startNum + 1, startDate, endDate
                    );
                })
                .collect(Collectors.toList());

        ProfileResponse.RollsInfo rollsInfo = new ProfileResponse.RollsInfo(activeRoll, completedRollList);

        return new ProfileResponse(userInfo, journeyInfo, rollsInfo);
    }

    @Transactional
    public void withdraw(Long userId, String refreshToken) {
        // Redis Refresh Token 먼저 삭제 (루프 방지)
        jwtTokenProvider.deleteRefreshToken(refreshToken);
        // JPQL 벌크 DELETE로 FK 의존 순서 명시적 제어
        // frame_photos → frames → chat_messages → chat_sessions → rolls → user
        framePhotoRepository.deleteAllByUserId(userId);
        frameRepository.deleteAllByUserId(userId);
        chatMessageRepository.deleteAllByUserId(userId);
        chatSessionRepository.deleteAllByUserId(userId);
        rollRepository.deleteAll(rollRepository.findByUserIdOrderByRollNumAsc(userId));
        userRepository.deleteById(userId);
    }
}
