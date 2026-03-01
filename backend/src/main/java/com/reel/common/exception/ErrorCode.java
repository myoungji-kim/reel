package com.reel.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),

    // Chat
    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "채팅 세션을 찾을 수 없습니다."),

    // Frame
    ALREADY_DEVELOPED(HttpStatus.CONFLICT, "이미 현상된 세션입니다."),
    FRAME_NOT_FOUND(HttpStatus.NOT_FOUND, "프레임을 찾을 수 없습니다."),

    // AI
    AI_RESPONSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI 응답 생성에 실패했습니다."),
    AI_PARSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI 응답 파싱에 실패했습니다."),

    // Server
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;
}
