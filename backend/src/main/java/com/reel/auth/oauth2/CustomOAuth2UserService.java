package com.reel.auth.oauth2;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    // TODO: Phase 3 — OAuth2 로그인 성공 시 User upsert 처리
}
