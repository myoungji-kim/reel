package com.reel.chat.controller;

import com.reel.chat.dto.ChatMessageRequest;
import com.reel.chat.dto.ChatMessageResponse;
import com.reel.chat.dto.TodaySessionResponse;
import com.reel.chat.service.ChatService;
import com.reel.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * GET /api/chat/session/today
     */
    @GetMapping("/session/today")
    public ResponseEntity<ApiResponse<TodaySessionResponse>> getTodaySession(
            @AuthenticationPrincipal Long userId) {

        return ResponseEntity.ok(ApiResponse.ok(chatService.getTodaySession(userId)));
    }

    /**
     * GET /api/chat/session/{sessionId}/messages
     */
    @GetMapping("/session/{sessionId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(ApiResponse.ok(chatService.getMessages(userId, sessionId)));
    }

    /**
     * POST /api/chat/session/{sessionId}/message
     */
    @PostMapping("/session/{sessionId}/message")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sessionId,
            @Valid @RequestBody ChatMessageRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                chatService.sendMessage(userId, sessionId, request.content())
        ));
    }
}
