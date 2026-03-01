package com.reel.auth.service;

import com.reel.auth.dto.TokenRotationResult;
import com.reel.auth.jwt.JwtTokenProvider;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;

    public TokenRotationResult refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ReelException(ErrorCode.TOKEN_INVALID);
        }
        return jwtTokenProvider.rotateRefreshToken(refreshToken);
    }

    public void logout(String refreshToken) {
        jwtTokenProvider.deleteRefreshToken(refreshToken);
    }
}
