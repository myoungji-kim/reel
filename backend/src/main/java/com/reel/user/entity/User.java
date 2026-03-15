package com.reel.user.entity;

import com.reel.auth.oauth2.OAuthUserInfo;
import com.reel.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(
    name = "users",
    uniqueConstraints = @UniqueConstraint(columnNames = {"oauth_id", "provider"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "oauth_id", nullable = false, length = 255)
    private String oauthId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OAuthProvider provider;

    @Column(length = 255)
    private String email;

    @Column(length = 100)
    private String nickname;

    @Column(name = "profile_img", length = 500)
    private String profileImg;

    @Column(name = "streak_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int streakCount = 0;

    @Column(name = "best_streak", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int bestStreak = 0;

    @Column(name = "last_frame_date")
    private LocalDate lastFrameDate;

    @Column(length = 100, columnDefinition = "VARCHAR(100) DEFAULT ''")
    private String bio = "";

    public static User of(OAuthProvider provider, OAuthUserInfo info) {
        User user = new User();
        user.oauthId = info.getProviderId();
        user.provider = provider;
        user.email = info.getEmail();
        user.nickname = info.getNickname();
        user.profileImg = info.getProfileImg();
        return user;
    }

    public void update(String nickname, String email, String profileImg) {
        this.nickname = nickname;
        this.email = email;
        this.profileImg = profileImg;
    }

    public void updateStreak(LocalDate today) {
        if (lastFrameDate == null) {
            streakCount = 1;
        } else if (lastFrameDate.equals(today)) {
            return;
        } else if (lastFrameDate.equals(today.minusDays(1))) {
            streakCount += 1;
        } else {
            streakCount = 1;
        }
        if (streakCount > bestStreak) bestStreak = streakCount;
        lastFrameDate = today;
    }
}
