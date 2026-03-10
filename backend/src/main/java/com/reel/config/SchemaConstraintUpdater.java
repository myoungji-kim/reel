package com.reel.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Hibernate 6는 enum 컬럼에 자동으로 CHECK constraint를 생성하지만
 * ddl-auto: update는 기존 constraint를 수정하지 않는다.
 * 새로운 enum 값(RETROSPECTIVE)이 추가될 때 constraint를 갱신한다.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class SchemaConstraintUpdater implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
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
}
