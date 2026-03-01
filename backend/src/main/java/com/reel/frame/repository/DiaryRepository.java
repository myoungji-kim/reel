package com.reel.frame.repository;

import com.reel.frame.entity.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiaryRepository extends JpaRepository<DiaryEntry, Long> {

    List<DiaryEntry> findByUserIdOrderByDiaryDateDesc(Long userId);

    long countByUserId(Long userId);
}
