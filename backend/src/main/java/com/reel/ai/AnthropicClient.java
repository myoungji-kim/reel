package com.reel.ai;

import com.reel.chat.entity.ChatMessage;
import com.reel.chat.entity.MessageRole;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class AnthropicClient {

    private static final String CHAT_SYSTEM_PROMPT = """
            당신은 사용자의 하루를 채팅으로 들어주는 따뜻한 AI 일기 친구입니다.
            규칙:
            - 짧고 자연스럽게 대화하세요. 2-3문장 이내로.
            - 공감하고, 더 이야기하도록 유도하는 질문을 1개만 던지세요.
            - 이모지는 1개까지만 사용하세요.
            - 강요하지 말고 편안하게 대화하세요.
            - 반말로 편하게 이야기하세요.
            - 반드시 한국어로만 응답하세요. 영어, 일본어, 중국어 등 다른 언어를 절대 섞지 마세요.

            [후속 질문 지침]
            - 사용자 메시지에서 감정, 구체적 장면, 등장인물(사람·동물), 장소·날씨·소리 등 감각적 요소가 언급되면 그 부분을 더 구체화하는 질문을 포함할 것
            - 질문은 반드시 1개로 제한. 여러 질문을 연달아 쏟아내지 말 것
            - 질문 어조: 캐주얼하고 따뜻하게. 인터뷰나 심문처럼 느껴지지 않을 것
            """;

    private static final String CONTEXT_SUFFICIENT_HINT = """

            [추가 지침]
            대화 맥락이 충분히 쌓였어. 더 파고드는 질문보다 공감과 따뜻한 마무리에 집중해줘.
            """;

    private static final int CONTEXT_MSG_THRESHOLD  = 5;
    private static final int CONTEXT_CHAR_THRESHOLD = 300;

    private final WebClient webClient;
    private final AnthropicProperties properties;

    public AnthropicClient(@Qualifier("anthropicWebClient") WebClient webClient,
                           AnthropicProperties properties) {
        this.webClient = webClient;
        this.properties = properties;
    }

    public String chat(List<ChatMessage> history) {
        // 맥락 충분 여부 판단: 사용자 메시지 수 또는 총 입력 글자 수 기준
        long userMsgCount = history.stream()
                .filter(m -> m.getRole() == MessageRole.USER)
                .count();
        long userCharCount = history.stream()
                .filter(m -> m.getRole() == MessageRole.USER)
                .mapToLong(m -> m.getContent().length())
                .sum();
        boolean contextSufficient = userMsgCount >= CONTEXT_MSG_THRESHOLD
                || userCharCount >= CONTEXT_CHAR_THRESHOLD;

        String systemPrompt = contextSufficient
                ? CHAT_SYSTEM_PROMPT + CONTEXT_SUFFICIENT_HINT
                : CHAT_SYSTEM_PROMPT;

        List<Message> messages = new ArrayList<>();
        messages.add(new Message("system", systemPrompt));

        // 첫 번째 user 메시지부터 포함
        int firstUserIdx = 0;
        for (int i = 0; i < history.size(); i++) {
            if (history.get(i).getRole() == MessageRole.USER) {
                firstUserIdx = i;
                break;
            }
        }
        history.subList(firstUserIdx, history.size()).forEach(m ->
                messages.add(new Message(
                        m.getRole() == MessageRole.USER ? "user" : "assistant",
                        m.getContent()
                ))
        );

        return call(new ChatRequest(properties.getModel(), messages, properties.getMaxTokens()));
    }

    public String develop(List<ChatMessage> history) {
        String conversation = history.stream()
                .map(m -> (m.getRole() == MessageRole.USER ? "나" : "AI") + ": " + m.getContent())
                .reduce("", (a, b) -> a + "\n" + b);

        String systemPrompt = """
                채팅 대화를 분석해서 JSON 형태로만 응답하세요.
                형식: {"title":"한 줄 제목","content":"일기 내용 (3-5문단, 감성적으로 정리)"}
                - 제목은 오늘 하루를 가장 잘 나타내는 짧은 문장
                - 내용은 사용자 입장에서 1인칭으로, 자연스러운 일기 문체로
                - JSON만 출력하세요
                """;

        List<Message> messages = List.of(
                new Message("system", systemPrompt),
                new Message("user", "다음 대화를 일기로 정리해주세요:\n\n" + conversation)
        );

        return call(new ChatRequest(properties.getModel(), messages, properties.getMaxTokens()));
    }

    private String call(ChatRequest request) {
        try {
            ChatResponse response = webClient
                    .post()
                    .uri("/chat/completions")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            res -> res.bodyToMono(String.class)
                                    .map(body -> {
                                        log.error("Groq API error response: {}", body);
                                        return new ReelException(ErrorCode.AI_RESPONSE_ERROR);
                                    })
                    )
                    .bodyToMono(ChatResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                throw new ReelException(ErrorCode.AI_RESPONSE_ERROR);
            }
            return response.choices().get(0).message().content();

        } catch (ReelException e) {
            throw e;
        } catch (Exception e) {
            log.error("Groq API call failed", e);
            throw new ReelException(ErrorCode.AI_RESPONSE_ERROR);
        }
    }

    // ── 내부 DTO ────────────────────────────────────

    record ChatRequest(String model, List<Message> messages, int max_tokens) {}

    record Message(String role, String content) {}

    record ChatResponse(List<Choice> choices) {}

    record Choice(Message message) {}
}
