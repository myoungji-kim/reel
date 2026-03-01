package com.reel.auth.oauth2;

import java.util.Map;

public class KakaoOAuth2UserInfo {

    private final Map<String, Object> attributes;

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    // TODO: Phase 3 — getId, getEmail, getNickname (kakao_account.profile)
}
