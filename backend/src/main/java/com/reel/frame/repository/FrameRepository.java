package com.reel.frame.repository;

import com.reel.frame.entity.Frame;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FrameRepository extends JpaRepository<Frame, Long> {

    long countByUserId(Long userId);

    @EntityGraph(attributePaths = {"photos"})
    Page<Frame> findByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"photos"})
    List<Frame> findByUserIdAndIsArchivedTrueOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"session", "photos"})
    Optional<Frame> findByIdAndUserId(Long id, Long userId);

    Optional<Frame> findFirstBySessionIdOrderByCreatedAtDesc(Long sessionId);

    List<Frame> findByUserIdAndDateIn(Long userId, List<LocalDate> dates);

    @Query("SELECT f FROM Frame f WHERE f.user.id = :userId AND f.isArchived = false " +
           "AND (LOWER(f.title) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(f.content) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "ORDER BY f.date DESC, f.createdAt DESC")
    Page<Frame> searchByKeyword(@Param("userId") Long userId, @Param("q") String q, Pageable pageable);

    @Query("SELECT f FROM Frame f WHERE f.user.id = :userId " +
           "AND f.date >= :startDate AND f.date <= :endDate " +
           "AND f.isArchived = false " +
           "ORDER BY f.date ASC, f.createdAt DESC")
    List<Frame> findByUserIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
