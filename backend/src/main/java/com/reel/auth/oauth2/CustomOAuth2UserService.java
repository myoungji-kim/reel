package com.reel.auth.oauth2;

import com.reel.user.entity.OAuthProvider;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(request);

        String registrationId = request.getClientRegistration().getRegistrationId();
        OAuthProvider provider = OAuthProvider.valueOf(registrationId.toUpperCase());

        OAuthUserInfo userInfo = switch (provider) {
            case GOOGLE -> new GoogleOAuth2UserInfo(oAuth2User.getAttributes());
            case KAKAO  -> new KakaoOAuth2UserInfo(oAuth2User.getAttributes());
        };

        User user = upsert(provider, userInfo);
        return new CustomOAuth2User(oAuth2User, user.getId());
    }

    private User upsert(OAuthProvider provider, OAuthUserInfo info) {
        return userRepository.findByOauthIdAndProvider(info.getProviderId(), provider)
                .map(existing -> {
                    existing.update(info.getNickname(), info.getEmail(), info.getProfileImg());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(User.of(provider, info)));
    }
}
