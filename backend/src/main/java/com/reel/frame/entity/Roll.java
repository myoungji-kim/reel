package com.reel.frame.entity;

import com.reel.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "rolls",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "roll_num"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Roll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "roll_num", nullable = false)
    private Integer rollNum;

    @Column(length = 100)
    private String title;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public static Roll of(User user, int rollNum) {
        Roll roll = new Roll();
        roll.user = user;
        roll.rollNum = rollNum;
        return roll;
    }

    public void updateTitle(String title) { this.title = title; }
}
