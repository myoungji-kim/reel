package com.reel.chat.repository;

import com.reel.chat.entity.ChatMessage;
import com.reel.chat.entity.MessageRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);

    long countBySessionIdAndRole(Long sessionId, MessageRole role);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM ChatMessage m WHERE m.session.id IN " +
            "(SELECT s.id FROM ChatSession s WHERE s.user.id = :userId)")
    void deleteAllByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
