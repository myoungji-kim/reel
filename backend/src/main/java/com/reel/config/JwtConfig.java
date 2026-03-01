package com.reel.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    // TODO: Phase 3 — secret, accessTokenExpiryMs, refreshTokenExpiryMs 바인딩
}
