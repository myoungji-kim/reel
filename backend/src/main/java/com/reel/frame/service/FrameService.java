package com.reel.frame.service;

import com.reel.chat.repository.ChatSessionRepository;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.frame.dto.BookmarkResponse;
import com.reel.frame.dto.CalendarFrameResponse;
import com.reel.frame.dto.FrameResponse;
import com.reel.frame.dto.OnThisDayResponse;
import com.reel.frame.dto.QuickFrameRequest;
import com.reel.frame.dto.QuickFrameResponse;
import com.reel.frame.dto.RollStatsResponse;
import com.reel.frame.dto.SaveFrameRequest;
import com.reel.frame.entity.Frame;
import com.reel.frame.entity.FrameType;
import com.reel.frame.repository.FrameRepository;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class FrameService {

    private final FrameRepository frameRepository;
    private final ChatSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public FrameResponse save(Long userId, Long frameId, SaveFrameRequest request) {
        Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));

        frame.update(request.title(), request.content(), request.mood());
        frame.updateDate(request.date());

        if (frame.getSession() != null) {
            frame.getSession().markDeveloped();
            sessionRepository.save(frame.getSession());
        }

        return FrameResponse.from(frame);
    }

    @Transactional(readOnly = true)
    public Page<FrameResponse> getFrames(Long userId, int page, int size) {
        return frameRepository
                .findByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(FrameResponse::from);
    }

    @Transactional
    public void archiveFrame(Long userId, Long frameId) {
        Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));
        frame.archive();
        frameRepository.save(frame);
    }

    @Transactional
    public void unarchiveFrame(Long userId, Long frameId) {
        Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));
        frame.unarchive();
        frameRepository.save(frame);
    }

    @Transactional(readOnly = true)
    public List<FrameResponse> getArchivedFrames(Long userId) {
        return frameRepository.findByUserIdAndIsArchivedTrueOrderByCreatedAtDesc(userId).stream()
                .map(FrameResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OnThisDayResponse> getOnThisDay(Long userId) {
        LocalDate today = LocalDate.now();
        List<LocalDate> dates = List.of(today.minusYears(1), today.minusYears(2));

        return frameRepository.findByUserIdAndDateIn(userId, dates).stream()
                .map(frame -> new OnThisDayResponse(
                        frame.getId(),
                        frame.getFrameNum(),
                        frame.getTitle(),
                        frame.getMood(),
                        frame.getDate(),
                        (int) ChronoUnit.YEARS.between(frame.getDate(), today)
                ))
                .toList();
    }

    @Transactional
    public QuickFrameResponse createQuickFrame(Long userId, QuickFrameRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ReelException(ErrorCode.USER_NOT_FOUND));

        int frameNum = (int) frameRepository.countByUserId(userId) + 1;
        LocalDate date = request.date() != null ? request.date() : LocalDate.now();

        Frame frame = frameRepository.save(Frame.quick(user, frameNum, request.title(), request.content(), date));
        return new QuickFrameResponse(frame.getId(), frame.getFrameNum(), frame.getTitle(), FrameType.QUICK.name());
    }

    @Transactional(readOnly = true)
    public Page<FrameResponse> searchFrames(Long userId, String q, int page, int size) {
        if (q == null || q.isBlank()) return Page.empty();
        return frameRepository.searchByKeyword(userId, q, PageRequest.of(page, size))
                .map(FrameResponse::from);
    }

    @Transactional(readOnly = true)
    public RollStatsResponse getRollStats(Long userId) {
        int totalFrames = (int) frameRepository.countByUserId(userId);
        int progressRaw = totalFrames % 24;
        // 24의 배수이면 새 롤이 시작된 상태 (ROLL 02, 0/24)
        if (progressRaw == 0 && totalFrames > 0) {
            return new RollStatsResponse((totalFrames / 24) + 1, 0, 24, totalFrames);
        }
        return new RollStatsResponse((totalFrames / 24) + 1, progressRaw, 24, totalFrames);
    }

    @Transactional(readOnly = true)
    public FrameResponse getFrame(Long userId, Long frameId) {
        Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));
        return FrameResponse.from(frame);
    }

    @Transactional(readOnly = true)
    public List<CalendarFrameResponse> getCalendarFrames(Long userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Frame> frames = frameRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        return frames.stream()
                .collect(Collectors.toMap(
                        Frame::getDate,
                        f -> f,
                        (existing, newer) -> newer.getCreatedAt().isAfter(existing.getCreatedAt()) ? newer : existing
                ))
                .values().stream()
                .sorted(Comparator.comparing(Frame::getDate))
                .map(f -> {
                    String preview = f.getContent() != null && f.getContent().length() > 150
                            ? f.getContent().substring(0, 150) + "…"
                            : f.getContent();
                    String thumbnail = f.getPhotos().isEmpty() ? null : f.getPhotos().get(0).getUrl();
                    return new CalendarFrameResponse(f.getId(), f.getDate(), f.getMood(), f.getTitle(), preview, thumbnail);
                })
                .toList();
    }

    @Transactional
    public BookmarkResponse toggleBookmark(Long userId, Long frameId) {
        Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));
        frame.toggleBookmark();
        frameRepository.save(frame);
        return new BookmarkResponse(frameId, frame.isBookmarked());
    }
}
