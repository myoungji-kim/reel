package com.reel.home.controller;

import com.reel.common.response.ApiResponse;
import com.reel.home.dto.HomeSummaryResponse;
import com.reel.home.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<HomeSummaryResponse>> getSummary(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(homeService.getSummary(userId)));
    }
}
