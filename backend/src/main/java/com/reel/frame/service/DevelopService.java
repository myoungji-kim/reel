package com.reel.frame.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reel.ai.AnthropicClient;
import com.reel.chat.entity.ChatMessage;
import com.reel.chat.entity.ChatSession;
import com.reel.chat.repository.ChatMessageRepository;
import com.reel.chat.repository.ChatSessionRepository;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.frame.dto.DevelopPreviewResponse;
import com.reel.frame.entity.Frame;
import com.reel.frame.repository.FrameRepository;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class DevelopService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final FrameRepository frameRepository;
    private final UserRepository userRepository;
    private final AnthropicClient anthropicClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public DevelopPreviewResponse develop(Long userId, Long sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ReelException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getUser().getId().equals(userId)) {
            throw new ReelException(ErrorCode.UNAUTHORIZED);
        }

        List<ChatMessage> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        String jsonText = extractJson(anthropicClient.develop(history));
        log.debug("develop JSON: {}", jsonText);

        String title;
        String content;
        try {
            Map<?, ?> map = objectMapper.readValue(jsonText, Map.class);
            title = (String) map.get("title");
            content = (String) map.get("content");
            if (title == null || content == null) throw new IllegalArgumentException("missing fields");
        } catch (Exception e) {
            log.warn("develop parse failed, raw: {}", jsonText);
            throw new ReelException(ErrorCode.AI_PARSE_ERROR);
        }

        // 재현상: 이미 현상된 세션은 기존 프레임을 재사용
        if (session.isDeveloped()) {
            Frame existingFrame = frameRepository.findBySessionId(sessionId)
                    .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));
            return new DevelopPreviewResponse(existingFrame.getId(), title, content);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ReelException(ErrorCode.USER_NOT_FOUND));

        int frameNum = (int) frameRepository.countByUserId(userId) + 1;
        Frame draft = frameRepository.save(
                Frame.draft(user, session, frameNum, title, content, session.getDate())
        );

        return new DevelopPreviewResponse(draft.getId(), title, content);
    }

    /** 모델이 ```json ... ``` 으로 감쌀 경우 JSON 부분만 추출 */
    private String extractJson(String raw) {
        String text = raw.trim();
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return text;
    }
}
