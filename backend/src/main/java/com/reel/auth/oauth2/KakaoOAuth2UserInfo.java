package com.reel.auth.oauth2;

import java.util.Map;

@SuppressWarnings("unchecked")
public class KakaoOAuth2UserInfo implements OAuthUserInfo {

    private final Map<String, Object> attributes;

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProviderId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getEmail() {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        return kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
    }

    @Override
    public String getNickname() {
        Map<String, Object> profile = getProfile();
        return profile != null ? (String) profile.get("nickname") : null;
    }

    @Override
    public String getProfileImg() {
        Map<String, Object> profile = getProfile();
        return profile != null ? (String) profile.get("profile_image_url") : null;
    }

    private Map<String, Object> getProfile() {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        return kakaoAccount != null ? (Map<String, Object>) kakaoAccount.get("profile") : null;
    }
}
