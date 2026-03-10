package com.reel.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.frame.entity.Frame;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnthropicService {

    private final AnthropicClient anthropicClient;
    private final ObjectMapper objectMapper;

    public record RetrospectiveResult(String title, String content) {}

    public RetrospectiveResult generateRetrospective(int year, int month, List<Frame> frames) {
        String framesSummary = frames.stream()
                .map(f -> String.format("[%s] %s\n%s", f.getDate(), f.getTitle(), f.getContent()))
                .collect(Collectors.joining("\n\n---\n\n"));

        String monthLabel = String.format("%d년 %d월", year, month);

        String prompt = String.format("""
                아래는 %s의 일기 기록들입니다.

                %s

                ---

                이 기록들을 바탕으로 %s을 회고하는 감성적인 에세이를 작성해주세요.

                [작성 규칙]
                - 분량: 200~300자 내외
                - 어조: 따뜻하고 감성적인 1인칭 시점 ("나는", "우리는" 혼용 가능)
                - 특정 날짜나 사건을 직접 언급하되, 전체 흐름으로 묶어줄 것
                - 마지막 문장은 다음 달로 이어지는 희망 또는 여운이 느껴지도록

                응답 형식 (JSON만 출력):
                {"title": "이 달을 한 문장으로 표현한 제목 (20자 이내)", "content": "에세이 본문"}
                """, monthLabel, framesSummary, monthLabel);

        String raw = anthropicClient.singleMessage(prompt);
        try {
            // JSON 블록 추출 (```json ... ``` 형태 대응)
            String json = raw.strip();
            if (json.startsWith("```")) {
                int start = json.indexOf('{');
                int end = json.lastIndexOf('}');
                json = json.substring(start, end + 1);
            }
            return objectMapper.readValue(json, RetrospectiveResult.class);
        } catch (Exception e) {
            log.error("Failed to parse retrospective JSON: {}", raw, e);
            throw new ReelException(ErrorCode.AI_PARSE_ERROR);
        }
    }
}
