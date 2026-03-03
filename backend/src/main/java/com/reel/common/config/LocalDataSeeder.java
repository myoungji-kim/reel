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
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("local")
@Slf4j
@RequiredArgsConstructor
public class LocalDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final FrameRepository frameRepository;

    private static final String[][] SEED_FRAMES = {
        {"봄볕 아래서", "봄바람이 살랑이는 날이었다. 오후 내내 창가에 앉아 따스한 햇살을 받으며 책을 읽었다.", "평온"},
        {"첫 출근의 긴장감", "새벽부터 잠이 깼다. 설레면서도 두렵고, 두렵지만 또 설레는 묘한 아침.", "설렘"},
        {"비 오는 토요일", "종일 비가 내렸다. 빗소리를 들으며 커피 한 잔. 아무것도 안 해도 되는 날이 이렇게 좋을 줄이야.", "평온"},
        {"친구와의 오랜만 만남", "3년 만에 만난 친구. 서로 많이 달라졌는데 또 전혀 안 달라진 것 같아서 웃겼다.", "기쁨"},
        {"야근 끝 귀가길", "밤 11시 버스. 졸린 눈으로 창밖을 봤더니 도시의 불빛이 아름다웠다. 왜 피곤할수록 예뻐 보일까.", "피곤"},
        {"일기 쓰기 시작", "오늘부터 일기를 써보기로 했다. 쓸 말이 없다고 생각했는데, 막상 쓰려니 넘친다.", "설렘"},
        {"혼자 먹은 점심", "식당에 혼자 들어갔다. 처음엔 어색했지만 생각보다 괜찮았다. 혼밥도 연습이 필요하다.", "무기력"},
        {"오래된 사진 발견", "서랍을 정리하다 고등학교 때 사진을 찾았다. 그때 나는 뭘 그렇게 웃고 있었을까.", "감사"},
        {"산책 30분", "운동 대신 그냥 걸었다. 30분 걷고 나니 머리가 맑아진 느낌. 가장 쉬운 처방인데 왜 자꾸 잊는 걸까.", "평온"},
        {"발표가 끝났다", "3주 준비한 발표가 끝났다. 잘 됐는지 모르겠지만 일단 끝났다는 것 자체가 해방감이다.", "기쁨"},
        {"갑자기 우울", "특별한 이유 없이 우울했다. 그냥 그런 날인가 보다 하고 그냥 두기로 했다.", "슬픔"},
        {"새벽 감성", "새벽 2시에 깨서 아무 생각 없이 유튜브를 봤다. 알고리즘이 옛날 가요를 추천해줘서 한 시간을 보냈다.", "외로움"},
        {"작년 오늘의 기억", "작년 오늘, 봄바람이 살짝 불던 날이었다. 창문 너머로 벚꽃이 흩날리는 걸 보며 괜히 두근거렸다. 처음 들어간 카페에서 마신 따뜻한 아메리카노 한 잔의 향기가 아직도 선명하다.", "평온"},
        {"집 청소의 쾌감", "오전 내내 청소를 했다. 깨끗해진 방을 보니 기분도 같이 정리된 것 같다.", "기쁨"},
        {"반성의 밤", "오늘 말을 너무 많이 했다. 필요 없는 말들도 있었다. 좀 더 조용히 살고 싶다.", "무기력"},
        {"작은 성공", "미루던 일을 드디어 마쳤다. 큰일은 아니지만 나한테는 꽤 중요한 완료였다.", "기쁨"},
        {"저녁 노을", "퇴근하면서 하늘이 너무 예뻐서 멈춰 섰다. 잠깐이었지만 그 잠깐이 오늘을 구해줬다.", "감사"},
        {"카페에서 혼자", "좋아하는 카페 구석 자리. 이어폰 끼고 아무것도 안 하기. 이게 충전이다.", "평온"},
        {"지하철에서 울 뻔", "퇴근 지하철에서 갑자기 눈물이 날 것 같았다. 참았다. 집에 가서 울어야지 했는데 집에 오니 괜찮아졌다.", "슬픔"},
        {"오늘의 소확행", "편의점에서 신제품 과자를 샀다. 맛있었다. 그것만으로 충분한 하루.", "기쁨"},
        {"시험 결과", "생각보다 잘 봤다. 기대 안 했는데 잘 나와서 더 기쁜 것 같다.", "설렘"},
        {"전화 한 통", "오랫동안 연락 못 했던 엄마한테 전화했다. 별말 없었는데도 끊고 나서 따뜻했다.", "감사"},
        {"피곤함의 정체", "왜 이렇게 피곤한지 생각해봤다. 몸이 아닌 마음이 피곤했던 것 같다. 그런 날이 있다.", "피곤"},
        {"롤 완성의 날", "24번째 일기를 쓰는 날. 필름 한 롤이 다 찼다는 게 실감이 난다. 작은 기록들이 쌓여서 이렇게 두꺼워졌다.", "감사"},
        {"두 번째 롤 시작", "새 롤의 첫 번째 프레임. 또 시작이다. 이번에도 잘 채워나갈 수 있겠지.", "설렘"},
    };

    @Override
    public void run(ApplicationArguments args) {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            log.info("[Seeder] 가입된 유저 없음 — 테스트 데이터 건너뜀");
            return;
        }

        User user = users.get(0);
        long existingCount = frameRepository.countByUserId(user.getId());

        if (existingCount > 0) {
            log.info("[Seeder] 프레임 이미 존재 ({}개) — 건너뜀", existingCount);
            return;
        }

        LocalDate today = LocalDate.now();
        List<Frame> frames = new ArrayList<>();

        for (int i = 0; i < SEED_FRAMES.length; i++) {
            int frameNum = i + 1;
            // frame #14 (i=13) → today.minusYears(1) (on-this-day 트리거)
            // 나머지: today.minusMonths(25-i)
            LocalDate date = (i == 13)
                    ? today.minusYears(1)
                    : today.minusMonths(25 - i);

            frames.add(Frame.seed(
                    user,
                    frameNum,
                    SEED_FRAMES[i][0],
                    SEED_FRAMES[i][1],
                    SEED_FRAMES[i][2],
                    date
            ));
        }

        frameRepository.saveAll(frames);
        log.info("[Seeder] 테스트 프레임 25개 삽입 완료 — userId={}", user.getId());
    }
}
