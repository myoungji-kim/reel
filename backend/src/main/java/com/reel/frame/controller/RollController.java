package com.reel.frame.controller;

import com.reel.common.response.ApiResponse;
import com.reel.frame.dto.RollInfoResponse;
import com.reel.frame.dto.RollTitleResponse;
import com.reel.frame.dto.RollTitleSuggestResponse;
import com.reel.frame.dto.UpdateRollTitleRequest;
import com.reel.frame.service.RollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rolls")
@RequiredArgsConstructor
public class RollController {

    private final RollService rollService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RollInfoResponse>>> getAllRolls(
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(rollService.getAllRolls(userId)));
    }

    @PatchMapping("/{rollNum}/title")
    public ResponseEntity<ApiResponse<RollTitleResponse>> updateTitle(
            @PathVariable int rollNum,
            @RequestBody @Valid UpdateRollTitleRequest request,
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                rollService.updateTitle(userId, rollNum, request.title())));
    }

    @PostMapping("/{rollNum}/title-suggest")
    public ResponseEntity<ApiResponse<RollTitleSuggestResponse>> suggestTitle(
            @PathVariable int rollNum,
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                rollService.suggestTitle(userId, rollNum)));
    }
}
