package com.reel.chat.repository;

import com.reel.chat.entity.ChatMessage;
import com.reel.chat.entity.MessageRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);

    long countBySessionIdAndRole(Long sessionId, MessageRole role);
}
