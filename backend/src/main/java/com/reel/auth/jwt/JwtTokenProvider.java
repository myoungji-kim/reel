package com.reel.auth.jwt;

import com.reel.auth.dto.TokenRotationResult;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private static final String REFRESH_TOKEN_KEY_PREFIX = "RT:";

    private final JwtConfig jwtConfig;
    private final StringRedisTemplate redisTemplate;

    // ── Access Token ────────────────────────────────

    public String generateAccessToken(Long userId) {
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getAccessTokenExpiryMs()))
                .signWith(secretKey())
                .compact();
    }

    public Long extractUserId(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    public boolean validateAccessToken(String token) {
        parseClaims(token);
        return true;
    }

    // ── Refresh Token ───────────────────────────────

    public String generateRefreshToken(Long userId) {
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_KEY_PREFIX + token,
                userId.toString(),
                jwtConfig.getRefreshTokenExpiryMs(),
                TimeUnit.MILLISECONDS
        );
        return token;
    }

    /**
     * Refresh Token Rotation:
     * 기존 토큰을 삭제하고 새 Access/Refresh Token 쌍을 발급한다.
     */
    public TokenRotationResult rotateRefreshToken(String oldRefreshToken) {
        String redisKey = REFRESH_TOKEN_KEY_PREFIX + oldRefreshToken;
        String userIdStr = redisTemplate.opsForValue().get(redisKey);

        if (userIdStr == null) {
            throw new ReelException(ErrorCode.TOKEN_INVALID);
        }

        Long userId = Long.parseLong(userIdStr);
        redisTemplate.delete(redisKey);

        String newAccessToken = generateAccessToken(userId);
        String newRefreshToken = generateRefreshToken(userId);
        return new TokenRotationResult(newAccessToken, newRefreshToken);
    }

    public void deleteRefreshToken(String refreshToken) {
        if (refreshToken != null) {
            redisTemplate.delete(REFRESH_TOKEN_KEY_PREFIX + refreshToken);
        }
    }

    // ── Internal ────────────────────────────────────

    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new ReelException(ErrorCode.TOKEN_EXPIRED);
        } catch (JwtException | IllegalArgumentException e) {
            throw new ReelException(ErrorCode.TOKEN_INVALID);
        }
    }

    private SecretKey secretKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtConfig.getSecret()));
    }
}
