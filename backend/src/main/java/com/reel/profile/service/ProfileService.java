package com.reel.profile.service;

import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.frame.entity.Frame;
import com.reel.frame.entity.Roll;
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
    private final RollRepository rollRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;

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

        List<Frame> allFrames = frameRepository.findByUserIdAndIsArchivedFalse(userId);
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
    public void withdraw(Long userId) {
        // 순서: 메시지 → 프레임(사진 cascade) → 세션 → 롤 → 유저
        // frames.session_id → chat_sessions FK 때문에 프레임을 먼저 삭제해야 함
        // 1. 채팅 메시지 삭제
        chatMessageRepository.deleteAllByUserId(userId);
        // 2. 프레임 전체 로드 후 deleteAll → CascadeType.ALL로 FramePhoto cascade 삭제
        frameRepository.deleteAll(frameRepository.findByUserId(userId));
        // 3. 채팅 세션 삭제 (이제 frames FK 없음)
        chatSessionRepository.deleteAllByUserId(userId);
        // 4. 롤 삭제
        rollRepository.deleteAll(rollRepository.findByUserIdOrderByRollNumAsc(userId));
        // 5. 유저 삭제
        userRepository.deleteById(userId);
    }
}
