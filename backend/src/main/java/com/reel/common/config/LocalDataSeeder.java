package com.reel.common.config;

import com.reel.frame.entity.Frame;
import com.reel.frame.repository.FrameRepository;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("local")
@Slf4j
@RequiredArgsConstructor
public class LocalDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final FrameRepository frameRepository;

    @Override
    public void run(ApplicationArguments args) {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            log.info("[Seeder] 가입된 유저 없음 — on-this-day 테스트 데이터 건너뜀");
            return;
        }

        User user = users.get(0);
        LocalDate targetDate = LocalDate.now().minusYears(1);

        boolean alreadyExists = !frameRepository
                .findByUserIdAndDateIn(user.getId(), List.of(targetDate))
                .isEmpty();

        if (alreadyExists) {
            log.info("[Seeder] on-this-day 테스트 데이터 이미 존재 — 건너뜀");
            return;
        }

        int nextNum = (int) frameRepository.countByUserId(user.getId()) + 1;
        Frame frame = Frame.seed(
                user,
                nextNum,
                "작년 오늘의 기억",
                "작년 오늘, 봄바람이 살짝 불던 날이었다. 창문 너머로 벚꽃이 흩날리는 걸 보며 괜히 두근거렸다. 처음 들어간 카페에서 마신 따뜻한 아메리카노 한 잔의 향기가 아직도 선명하다.",
                "평온",
                targetDate
        );
        frameRepository.save(frame);
        log.info("[Seeder] on-this-day 테스트 프레임 삽입 완료 — userId={}, date={}", user.getId(), targetDate);
    }
}
