package com.reel.frame.repository;

import com.reel.frame.entity.FramePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FramePhotoRepository extends JpaRepository<FramePhoto, Long> {

    List<FramePhoto> findByFrameIdOrderByOrderNumAsc(Long frameId);

    int countByFrameId(Long frameId);

    Optional<FramePhoto> findByIdAndFrameId(Long id, Long frameId);
}
