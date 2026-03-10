package com.reel.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * 앱 시작 시 스키마/데이터 보정 작업을 수행한다.
 * 1. frames_frame_type_check constraint 갱신
 * 2. streak 백필: 기존 프레임 데이터로 streak_count / last_frame_date 계산
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class SchemaConstraintUpdater implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        fixFrameTypeConstraint();
        backfillStreak();
    }

    private void fixFrameTypeConstraint() {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE frames DROP CONSTRAINT IF EXISTS frames_frame_type_check"
            );
            jdbcTemplate.execute(
                "ALTER TABLE frames ADD CONSTRAINT frames_frame_type_check " +
                "CHECK (frame_type IN ('DEVELOPED', 'QUICK', 'RETROSPECTIVE'))"
            );
            log.debug("frames_frame_type_check constraint updated");
        } catch (Exception e) {
            log.warn("Could not update frames_frame_type_check constraint: {}", e.getMessage());
        }
    }

    /**
     * streak_count=0 이고 last_frame_date=NULL 인 유저 중 프레임이 있는 경우
     * 기존 프레임 날짜로 streak을 역산해 채운다. (기능 최초 배포 시 1회성)
     */
    private void backfillStreak() {
        try {
            // 스트릭이 아직 계산되지 않은 유저 ID 목록
            List<Long> userIds = jdbcTemplate.queryForList(
                "SELECT DISTINCT u.id FROM users u " +
                "JOIN frames f ON f.user_id = u.id " +
                "WHERE u.streak_count = 0 AND u.last_frame_date IS NULL " +
                "AND f.is_archived = false AND f.frame_type != 'RETROSPECTIVE'",
                Long.class
            );

            for (Long userId : userIds) {
                // 해당 유저의 프레임 날짜 목록 (중복 제거, 최신순)
                List<LocalDate> dates = jdbcTemplate.queryForList(
                    "SELECT DISTINCT DATE(date) FROM frames " +
                    "WHERE user_id = ? AND is_archived = false AND frame_type != 'RETROSPECTIVE' " +
                    "ORDER BY DATE(date) DESC",
                    LocalDate.class, userId
                );

                if (dates.isEmpty()) continue;

                LocalDate lastDate = dates.get(0);
                LocalDate today = LocalDate.now();

                // 가장 최근 날짜가 오늘 또는 어제가 아니면 스트릭은 끊김 → 0 유지
                if (lastDate.isBefore(today.minusDays(1))) continue;

                // 연속 일수 계산
                int streak = 1;
                for (int i = 1; i < dates.size(); i++) {
                    if (dates.get(i - 1).minusDays(1).equals(dates.get(i))) {
                        streak++;
                    } else {
                        break;
                    }
                }

                jdbcTemplate.update(
                    "UPDATE users SET streak_count = ?, last_frame_date = ? WHERE id = ?",
                    streak, lastDate, userId
                );
                log.debug("Backfilled streak for userId={}: streak={}, lastDate={}", userId, streak, lastDate);
            }
        } catch (Exception e) {
            log.warn("Could not backfill streak: {}", e.getMessage());
        }
    }
}
