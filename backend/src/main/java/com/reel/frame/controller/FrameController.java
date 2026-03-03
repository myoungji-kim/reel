package com.reel.frame.controller;

import com.reel.common.response.ApiResponse;
import com.reel.frame.dto.DevelopPreviewResponse;
import com.reel.frame.dto.FrameResponse;
import com.reel.frame.dto.OnThisDayResponse;
import com.reel.frame.dto.RollStatsResponse;
import com.reel.frame.dto.PhotoResponse;
import com.reel.frame.dto.SaveFrameRequest;
import com.reel.frame.service.DevelopService;
import com.reel.frame.service.FrameService;
import com.reel.frame.service.PhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;



@RestController
@RequestMapping("/api/frames")
@RequiredArgsConstructor
public class FrameController {

    private final DevelopService developService;
    private final FrameService frameService;
    private final PhotoService photoService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<FrameResponse>>> searchFrames(
            @AuthenticationPrincipal Long userId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.searchFrames(userId, q, page, size)));
    }

    @GetMapping("/roll-stats")
    public ResponseEntity<ApiResponse<RollStatsResponse>> getRollStats(
            @AuthenticationPrincipal Long userId) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.getRollStats(userId)));
    }

    @GetMapping("/on-this-day")
    public ResponseEntity<ApiResponse<List<OnThisDayResponse>>> getOnThisDay(
            @AuthenticationPrincipal Long userId) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.getOnThisDay(userId)));
    }

    @PostMapping("/develop/{sessionId}")
    public ResponseEntity<ApiResponse<DevelopPreviewResponse>> develop(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(ApiResponse.ok(developService.develop(userId, sessionId)));
    }

    @PutMapping("/{frameId}")
    public ResponseEntity<ApiResponse<FrameResponse>> save(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long frameId,
            @Valid @RequestBody SaveFrameRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.save(userId, frameId, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FrameResponse>>> getFrames(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.getFrames(userId, page, size)));
    }

    @GetMapping("/{frameId}")
    public ResponseEntity<ApiResponse<FrameResponse>> getFrame(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long frameId) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.getFrame(userId, frameId)));
    }

    @PostMapping(value = "/{frameId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<PhotoResponse>>> uploadPhotos(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long frameId,
            @RequestPart List<MultipartFile> files) {

        return ResponseEntity.ok(ApiResponse.ok(photoService.upload(userId, frameId, files)));
    }

    @DeleteMapping("/{frameId}/photos/{photoId}")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long frameId,
            @PathVariable Long photoId) {

        photoService.delete(userId, frameId, photoId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
