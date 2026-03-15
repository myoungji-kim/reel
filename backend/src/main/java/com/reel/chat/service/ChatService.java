package com.reel.chat.service;

import com.reel.ai.AnthropicClient;
import com.reel.chat.dto.ChatMessageResponse;
import com.reel.chat.dto.TodaySessionResponse;
import com.reel.chat.entity.ChatMessage;
import com.reel.chat.entity.ChatSession;
import com.reel.chat.entity.MessageRole;
import com.reel.chat.repository.ChatMessageRepository;
import com.reel.chat.repository.ChatSessionRepository;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final String INITIAL_GREETING =
            "오늘 하루 어땠어요? 🎞️\n생각나는 거 뭐든 얘기해줘요. 나중에 일기로 현상해드릴게요.";

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AnthropicClient anthropicClient;

    /**
     * GET /api/chat/session/today
     * 오늘 세션 조회 (없으면 생성 + 초기 인사 메시지 삽입)
     */
    @Transactional
    public TodaySessionResponse getTodaySession(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ReelException(ErrorCode.USER_NOT_FOUND));

        LocalDate today = LocalDate.now();

        ChatSession session = sessionRepository.findByUserIdAndDate(userId, today)
                .orElseGet(() -> {
                    ChatSession newSession = sessionRepository.save(ChatSession.of(user, today));
                    // 새 세션: 초기 인사 메시지 삽입
                    messageRepository.save(ChatMessage.of(newSession, MessageRole.AI, INITIAL_GREETING));
                    return newSession;
                });

        List<ChatMessageResponse> messages = messageRepository
                .findBySessionIdOrderByCreatedAtAsc(session.getId())
                .stream()
                .map(ChatMessageResponse::from)
                .toList();

        return new TodaySessionResponse(session.getId(), session.getDate(), session.isDeveloped(), messages);
    }

    /**
     * GET /api/chat/session/{sessionId}/messages
     * 세션 메시지 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long userId, Long sessionId) {
        ChatSession session = getSessionForUser(userId, sessionId);
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId())
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    /**
     * POST /api/chat/session/{sessionId}/message
     * 유저 메시지 저장 + AI 응답 생성 후 반환
     */
    @Transactional
    public ChatMessageResponse sendMessage(Long userId, Long sessionId, String content) {
        ChatSession session = getSessionForUser(userId, sessionId);

        // 유저 메시지 저장
        messageRepository.save(ChatMessage.of(session, MessageRole.USER, content));

        // AI 응답 생성 (전체 히스토리 기반)
        List<ChatMessage> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        String aiText = anthropicClient.chat(history);

        // ---SUGGEST--- 구분자 파싱: DB에는 본문만, 응답에 suggestText 포함
        String mainText = aiText;
        String suggestText = null;
        int sepIdx = aiText.indexOf("---SUGGEST---");
        if (sepIdx >= 0) {
            mainText = aiText.substring(0, sepIdx).strip();
            suggestText = aiText.substring(sepIdx + "---SUGGEST---".length()).strip();
        }

        // AI 응답 저장 (본문만)
        ChatMessage aiMessage = messageRepository.save(ChatMessage.of(session, MessageRole.AI, mainText));
        return suggestText != null
                ? ChatMessageResponse.withSuggest(aiMessage, suggestText)
                : ChatMessageResponse.from(aiMessage);
    }

    private ChatSession getSessionForUser(Long userId, Long sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ReelException(ErrorCode.SESSION_NOT_FOUND));
        if (!session.getUser().getId().equals(userId)) {
            throw new ReelException(ErrorCode.UNAUTHORIZED);
        }
        return session;
    }
}
