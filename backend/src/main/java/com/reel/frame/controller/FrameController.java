package com.reel.frame.controller;

import com.reel.common.response.ApiResponse;
import com.reel.frame.dto.BookmarkResponse;
import com.reel.frame.dto.CalendarFrameResponse;
import com.reel.frame.dto.CreateRetrospectiveRequest;
import com.reel.frame.dto.DevelopPreviewResponse;
import com.reel.frame.dto.FrameResponse;
import com.reel.frame.dto.OnThisDayResponse;
import com.reel.frame.dto.QuickFrameRequest;
import com.reel.frame.dto.QuickFrameResponse;
import com.reel.frame.dto.RetrospectiveAvailableResponse;
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
import java.util.Map;



@RestController
@RequestMapping("/api/frames")
@RequiredArgsConstructor
public class FrameController {

    private final DevelopService developService;
    private final FrameService frameService;
    private final PhotoService photoService;

    @GetMapping("/retrospective/available")
    public ResponseEntity<ApiResponse<RetrospectiveAvailableResponse>> checkRetrospectiveAvailable(
            @AuthenticationPrincipal Long userId,
            @RequestParam int year,
            @RequestParam int month) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.checkRetrospectiveAvailable(userId, year, month)));
    }

    @PostMapping("/retrospective")
    public ResponseEntity<ApiResponse<FrameResponse>> createRetrospective(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreateRetrospectiveRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.createRetrospective(userId, request.year(), request.month())));
    }

    @PostMapping("/quick")
    public ResponseEntity<ApiResponse<QuickFrameResponse>> createQuickFrame(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody QuickFrameRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.createQuickFrame(userId, request)));
    }

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

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<CalendarFrameResponse>>> getCalendarFrames(
            @AuthenticationPrincipal Long userId,
            @RequestParam int year,
            @RequestParam int month) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.getCalendarFrames(userId, year, month)));
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

    @GetMapping("/archived")
    public ResponseEntity<ApiResponse<List<FrameResponse>>> getArchivedFrames(
            @AuthenticationPrincipal Long userId) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.getArchivedFrames(userId)));
    }

    @PutMapping("/{frameId}/bookmark")
    public ResponseEntity<ApiResponse<BookmarkResponse>> toggleBookmark(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long frameId) {

        return ResponseEntity.ok(ApiResponse.ok(frameService.toggleBookmark(userId, frameId)));
    }

    @PatchMapping("/{frameId}/archive")
    public ResponseEntity<ApiResponse<Map<String, Long>>> archiveFrame(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long frameId) {

        frameService.archiveFrame(userId, frameId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("frameId", frameId)));
    }

    @PatchMapping("/{frameId}/unarchive")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unarchiveFrame(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long frameId) {

        frameService.unarchiveFrame(userId, frameId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("frameId", frameId)));
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
