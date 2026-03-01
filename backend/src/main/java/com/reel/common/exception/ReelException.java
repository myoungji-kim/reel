package com.reel.common.exception;

import lombok.Getter;

@Getter
public class ReelException extends RuntimeException {

    private final ErrorCode errorCode;

    public ReelException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
