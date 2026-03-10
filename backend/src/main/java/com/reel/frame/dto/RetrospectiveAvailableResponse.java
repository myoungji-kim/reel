package com.reel.frame.dto;

public record RetrospectiveAvailableResponse(
        boolean available,
        int frameCount,
        boolean alreadyGenerated
) {}
