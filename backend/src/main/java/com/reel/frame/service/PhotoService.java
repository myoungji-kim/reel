package com.reel.frame.service;

import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.common.s3.S3Uploader;
import com.reel.frame.dto.PhotoResponse;
import com.reel.frame.entity.Frame;
import com.reel.frame.entity.FramePhoto;
import com.reel.frame.repository.FramePhotoRepository;
import com.reel.frame.repository.FrameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PhotoService {

    private static final int MAX_PHOTOS = 5;

    @Value("${upload.path}")
    private String uploadPath;

    private final FrameRepository frameRepository;
    private final FramePhotoRepository framePhotoRepository;

    @Autowired(required = false)
    private S3Uploader s3Uploader;

    @Transactional
    public List<PhotoResponse> upload(Long userId, Long frameId, List<MultipartFile> files) {
        Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));

        int currentCount = framePhotoRepository.countByFrameId(frameId);
        if (currentCount + files.size() > MAX_PHOTOS) {
            throw new ReelException(ErrorCode.PHOTO_LIMIT_EXCEEDED);
        }

        int orderStart = currentCount;
        List<FramePhoto> saved = files.stream().map(file -> {
            String storedUrl = s3Uploader != null
                    ? uploadToS3(file, frameId)
                    : uploadToLocal(file, frameId);
            return FramePhoto.of(frame, storedUrl, orderStart + files.indexOf(file));
        }).toList();

        framePhotoRepository.saveAll(saved);

        return saved.stream()
                .map(p -> new PhotoResponse(p.getId(), p.getUrl(), p.getOrderNum()))
                .toList();
    }

    @Transactional
    public void delete(Long userId, Long frameId, Long photoId) {
        frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));

        FramePhoto photo = framePhotoRepository.findByIdAndFrameId(photoId, frameId)
                .orElseThrow(() -> new ReelException(ErrorCode.PHOTO_NOT_FOUND));

        if (s3Uploader != null) {
            s3Uploader.delete(photo.getFileName());
        } else {
            Path filePath = Paths.get(uploadPath, "photos", String.valueOf(frameId), photo.getFileName());
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.warn("Failed to delete file: {}", filePath, e);
            }
        }

        framePhotoRepository.delete(photo);
    }

    private String uploadToS3(MultipartFile file, Long frameId) {
        try {
            return s3Uploader.upload(file, "photos/" + frameId);
        } catch (IOException e) {
            log.error("Failed to upload to S3", e);
            throw new ReelException(ErrorCode.PHOTO_UPLOAD_FAILED);
        }
    }

    private String uploadToLocal(MultipartFile file, Long frameId) {
        Path dir = Paths.get(uploadPath, "photos", String.valueOf(frameId));
        try {
            Files.createDirectories(dir);
            String ext = getExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + ext;
            file.transferTo(dir.resolve(fileName));
            return fileName;
        } catch (IOException e) {
            log.error("Failed to save file locally", e);
            throw new ReelException(ErrorCode.PHOTO_UPLOAD_FAILED);
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) return "";
        return "." + originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
    }
}
