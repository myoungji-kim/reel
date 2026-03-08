package com.reel.frame.service;

import com.reel.ai.AnthropicClient;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.frame.dto.RollInfoResponse;
import com.reel.frame.dto.RollTitleResponse;
import com.reel.frame.dto.RollTitleSuggestResponse;
import com.reel.frame.entity.Roll;
import com.reel.frame.repository.FrameRepository;
import com.reel.frame.repository.RollRepository;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RollService {

    private final RollRepository rollRepository;
    private final FrameRepository frameRepository;
    private final AnthropicClient anthropicClient;
    private final UserRepository userRepository;

    @Transactional
    public void ensureRollCreated(User user, int rollNum) {
        if (rollRepository.findByUserIdAndRollNum(user.getId(), rollNum).isEmpty()) {
            rollRepository.save(Roll.of(user, rollNum));
        }
    }

    /** Roll이 없으면 자동 생성(upsert) */
    private Roll findOrCreateRoll(Long userId, int rollNum) {
        return rollRepository.findByUserIdAndRollNum(userId, rollNum)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ReelException(ErrorCode.USER_NOT_FOUND));
                    return rollRepository.save(Roll.of(user, rollNum));
                });
    }

    @Transactional
    public RollTitleResponse updateTitle(Long userId, int rollNum, String title) {
        Roll roll = findOrCreateRoll(userId, rollNum);
        roll.updateTitle(title);
        return new RollTitleResponse(rollNum, roll.getTitle());
    }

    @Transactional(readOnly = true)
    public List<RollInfoResponse> getAllRolls(Long userId) {
        return rollRepository.findByUserIdOrderByRollNumAsc(userId).stream()
                .map(r -> new RollInfoResponse(r.getRollNum(), r.getTitle()))
                .toList();
    }

    @Transactional
    public RollTitleSuggestResponse suggestTitle(Long userId, int rollNum) {
        findOrCreateRoll(userId, rollNum); // Roll 없으면 생성

        int startFrameNum = (rollNum - 1) * 24 + 1;
        int endFrameNum = rollNum * 24;

        List<String> titles = frameRepository.findTitlesByUserIdAndFrameNumBetween(
                userId, startFrameNum, endFrameNum);

        String titlesText = String.join(", ", titles);
        String prompt = String.format("""
                다음은 한 롤에 담긴 일기의 제목 목록입니다:
                %s

                이 기록들을 하나로 묶는 감성적인 롤 이름을 10자 이내로 제안해주세요.
                이름만 출력하고, 따옴표나 설명 없이 답변해주세요.
                """, titlesText);

        String suggested = anthropicClient.singleMessage(prompt).trim();
        return new RollTitleSuggestResponse(suggested);
    }
}
