package com.reel.frame.repository;

import com.reel.frame.entity.Frame;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FrameRepository extends JpaRepository<Frame, Long> {

    long countByUserId(Long userId);

    Page<Frame> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Frame> findByIdAndUserId(Long id, Long userId);
}
