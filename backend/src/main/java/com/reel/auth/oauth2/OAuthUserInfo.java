package com.reel.auth.oauth2;

public interface OAuthUserInfo {

    String getProviderId();
    String getEmail();
    String getNickname();
    String getProfileImg();
}
