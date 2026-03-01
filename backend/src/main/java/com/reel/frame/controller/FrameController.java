package com.reel.frame.controller;

import com.reel.common.response.ApiResponse;
import com.reel.frame.dto.DevelopPreviewResponse;
import com.reel.frame.dto.FrameResponse;
import com.reel.frame.dto.SaveFrameRequest;
import com.reel.frame.service.DevelopService;
import com.reel.frame.service.FrameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/frames")
@RequiredArgsConstructor
public class FrameController {

    private final DevelopService developService;
    private final FrameService frameService;

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
}
