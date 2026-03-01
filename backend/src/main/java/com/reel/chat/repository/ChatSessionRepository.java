package com.reel.chat.repository;

import com.reel.chat.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findByUserIdAndDate(Long userId, LocalDate date);
}
