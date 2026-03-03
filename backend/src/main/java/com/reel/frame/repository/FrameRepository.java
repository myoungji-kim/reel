package com.reel.frame.repository;

import com.reel.frame.entity.Frame;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FrameRepository extends JpaRepository<Frame, Long> {

    long countByUserId(Long userId);

    @EntityGraph(attributePaths = {"photos"})
    Page<Frame> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"session", "photos"})
    Optional<Frame> findByIdAndUserId(Long id, Long userId);

    Optional<Frame> findBySessionId(Long sessionId);

    List<Frame> findByUserIdAndDateIn(Long userId, List<LocalDate> dates);
}
