package com.reel.frame.repository;

import com.reel.frame.entity.Frame;
import com.reel.frame.entity.FrameType;
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

    @Query("SELECT f.title FROM Frame f WHERE f.user.id = :userId " +
           "AND f.frameNum BETWEEN :start AND :end AND f.isArchived = false " +
           "ORDER BY f.frameNum ASC")
    List<String> findTitlesByUserIdAndFrameNumBetween(
            @Param("userId") Long userId,
            @Param("start") int start,
            @Param("end") int end
    );

    @Query("SELECT f FROM Frame f WHERE f.user.id = :userId " +
           "AND f.date >= :startDate AND f.date <= :endDate " +
           "AND f.isArchived = false " +
           "ORDER BY f.date ASC, f.createdAt DESC")
    List<Frame> findByUserIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(f) FROM Frame f " +
           "WHERE f.user.id = :userId " +
           "AND YEAR(f.date) = :year AND MONTH(f.date) = :month " +
           "AND f.isArchived = false AND f.frameType != com.reel.frame.entity.FrameType.RETROSPECTIVE")
    int countByUserIdAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("SELECT COUNT(f) > 0 FROM Frame f " +
           "WHERE f.user.id = :userId " +
           "AND YEAR(f.date) = :year AND MONTH(f.date) = :month " +
           "AND f.frameType = com.reel.frame.entity.FrameType.RETROSPECTIVE")
    boolean existsRetrospectiveByUserIdAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("SELECT f FROM Frame f " +
           "WHERE f.user.id = :userId " +
           "AND YEAR(f.date) = :year AND MONTH(f.date) = :month " +
           "AND f.isArchived = false AND f.frameType != com.reel.frame.entity.FrameType.RETROSPECTIVE " +
           "ORDER BY f.date ASC")
    List<Frame> findAllByUserIdAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month
    );

    List<Frame> findByUserId(Long userId);

    List<Frame> findByUserIdAndIsArchivedFalse(Long userId);

    @Query("SELECT f.date FROM Frame f " +
           "WHERE f.user.id = :userId AND f.frameNum BETWEEN :start AND :end")
    List<LocalDate> findDatesByRollNum(
            @Param("userId") Long userId,
            @Param("start") int start,
            @Param("end") int end
    );

}
