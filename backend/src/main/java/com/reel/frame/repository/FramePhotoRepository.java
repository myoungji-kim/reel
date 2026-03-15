package com.reel.frame.repository;

import com.reel.frame.entity.FramePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FramePhotoRepository extends JpaRepository<FramePhoto, Long> {

    List<FramePhoto> findByFrameIdOrderByOrderNumAsc(Long frameId);

    int countByFrameId(Long frameId);

    Optional<FramePhoto> findByIdAndFrameId(Long id, Long frameId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        "DELETE FROM FramePhoto p WHERE p.frame.id IN " +
        "(SELECT f.id FROM Frame f WHERE f.user.id = :userId)")
    void deleteAllByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
