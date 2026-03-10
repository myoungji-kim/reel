package com.reel.user.controller;

import com.reel.common.response.ApiResponse;
import com.reel.user.dto.StreakResponse;
import com.reel.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/streak")
    public ResponseEntity<ApiResponse<StreakResponse>> getStreak(
            @AuthenticationPrincipal Long userId) {

        return ResponseEntity.ok(ApiResponse.ok(userService.getStreak(userId)));
    }
}
