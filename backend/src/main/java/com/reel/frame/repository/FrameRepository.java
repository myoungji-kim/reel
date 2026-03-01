package com.reel.frame.repository;

import com.reel.frame.entity.Frame;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FrameRepository extends JpaRepository<Frame, Long> {

    long countByUserId(Long userId);

    Page<Frame> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // session 즉시 로딩 — FrameService.save에서 N+1 방지
    @EntityGraph(attributePaths = {"session"})
    Optional<Frame> findByIdAndUserId(Long id, Long userId);
}
