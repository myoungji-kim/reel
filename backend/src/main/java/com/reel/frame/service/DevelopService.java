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
        if (session.isDeveloped()) {
            throw new ReelException(ErrorCode.ALREADY_DEVELOPED);
        }

        List<ChatMessage> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        String jsonText = anthropicClient.develop(history);

        String title;
        String content;
        try {
            Map<?, ?> map = objectMapper.readValue(jsonText, Map.class);
            title = (String) map.get("title");
            content = (String) map.get("content");
            if (title == null || content == null) throw new IllegalArgumentException("missing fields");
        } catch (Exception e) {
            throw new ReelException(ErrorCode.AI_PARSE_ERROR);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ReelException(ErrorCode.USER_NOT_FOUND));

        int frameNum = (int) frameRepository.countByUserId(userId) + 1;
        Frame draft = frameRepository.save(
                Frame.draft(user, session, frameNum, title, content, session.getDate())
        );

        return new DevelopPreviewResponse(draft.getId(), title, content);
    }
}
