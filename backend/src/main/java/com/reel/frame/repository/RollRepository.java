package com.reel.frame.repository;

import com.reel.frame.entity.Roll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RollRepository extends JpaRepository<Roll, Long> {
    Optional<Roll> findByUserIdAndRollNum(Long userId, int rollNum);
    List<Roll> findByUserIdOrderByRollNumAsc(Long userId);
}
