package com.reel.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.reel.chat.entity.ChatMessage;
import com.reel.chat.entity.MessageRole;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AnthropicClient {

    private static final String ANTHROPIC_VERSION = "2023-06-01";
    private static final String CHAT_SYSTEM_PROMPT = """
            당신은 사용자의 하루를 채팅으로 들어주는 따뜻한 AI 일기 친구입니다.
            규칙:
            - 짧고 자연스럽게 대화하세요. 2-3문장 이내로.
            - 공감하고, 더 이야기하도록 유도하는 질문을 1개만 던지세요.
            - 이모지는 1개까지만 사용하세요.
            - 강요하지 말고 편안하게 대화하세요.
            - 반말로 편하게 이야기하세요.
            """;

    private final AnthropicProperties properties;

    /**
     * 채팅 응답 생성.
     *
     * @param history 세션의 전체 메시지 목록 (현재 유저 메시지 포함)
     * @return AI 응답 텍스트
     */
    public String chat(List<ChatMessage> history) {
        List<Message> messages = history.stream()
                .map(m -> new Message(
                        m.getRole() == MessageRole.USER ? "user" : "assistant",
                        m.getContent()
                ))
                .toList();

        ChatRequest request = new ChatRequest(
                properties.getModel(),
                properties.getMaxTokens(),
                CHAT_SYSTEM_PROMPT,
                messages
        );

        return call(request);
    }

    /**
     * 일기 현상 — 대화 내용을 JSON {"title":"...","content":"..."} 형태로 반환.
     */
    public String develop(List<ChatMessage> history) {
        String conversation = history.stream()
                .map(m -> (m.getRole() == MessageRole.USER ? "나" : "AI") + ": " + m.getContent())
                .reduce("", (a, b) -> a + "\n" + b);

        List<Message> messages = List.of(
                new Message("user", "다음 대화를 일기로 정리해주세요:\n\n" + conversation)
        );

        String systemPrompt = """
                채팅 대화를 분석해서 JSON 형태로만 응답하세요.
                형식: {"title":"한 줄 제목","content":"일기 내용 (3-5문단, 감성적으로 정리)"}
                - 제목은 오늘 하루를 가장 잘 나타내는 짧은 문장
                - 내용은 사용자 입장에서 1인칭으로, 자연스러운 일기 문체로
                - JSON만 출력하세요
                """;

        ChatRequest request = new ChatRequest(
                properties.getModel(),
                properties.getMaxTokens(),
                systemPrompt,
                messages
        );

        return call(request);
    }

    private String call(ChatRequest request) {
        try {
            ChatResponse response = buildWebClient()
                    .post()
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            res -> res.bodyToMono(String.class)
                                    .map(body -> new ReelException(ErrorCode.AI_RESPONSE_ERROR))
                    )
                    .bodyToMono(ChatResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null || response.content() == null || response.content().isEmpty()) {
                throw new ReelException(ErrorCode.AI_RESPONSE_ERROR);
            }
            return response.content().get(0).text();

        } catch (ReelException e) {
            throw e;
        } catch (Exception e) {
            throw new ReelException(ErrorCode.AI_RESPONSE_ERROR);
        }
    }

    private WebClient buildWebClient() {
        return WebClient.builder()
                .baseUrl(properties.getApiUrl())
                .defaultHeader("x-api-key", properties.getApiKey())
                .defaultHeader("anthropic-version", ANTHROPIC_VERSION)
                .defaultHeader("content-type", "application/json")
                .build();
    }

    // ── 내부 DTO ────────────────────────────────────

    record ChatRequest(
            String model,
            @JsonProperty("max_tokens") int maxTokens,
            String system,
            List<Message> messages
    ) {}

    record Message(String role, String content) {}

    record ChatResponse(List<ContentBlock> content) {
        record ContentBlock(String type, String text) {}
    }
}
