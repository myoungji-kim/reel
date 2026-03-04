package com.reel.frame.entity;

import com.reel.chat.entity.ChatSession;
import com.reel.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "frames")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Frame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ChatSession session;

    @Column(name = "frame_num", nullable = false)
    private Integer frameNum;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 50)
    private String mood;

    @Column(name = "frame_type", nullable = false, columnDefinition = "VARCHAR(20)")
    @Enumerated(EnumType.STRING)
    private FrameType frameType = FrameType.DEVELOPED;

    @Column(name = "is_archived", columnDefinition = "BOOLEAN NOT NULL DEFAULT FALSE")
    private boolean isArchived = false;

    @Column(name = "is_bookmarked", columnDefinition = "BOOLEAN NOT NULL DEFAULT FALSE")
    private boolean isBookmarked = false;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "frame", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderNum ASC")
    private List<FramePhoto> photos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static Frame draft(User user, ChatSession session, Integer frameNum,
                              String title, String content, LocalDate date) {
        Frame frame = new Frame();
        frame.user = user;
        frame.session = session;
        frame.frameNum = frameNum;
        frame.title = title;
        frame.content = content;
        frame.date = date;
        return frame;
    }

    public static Frame seed(User user, int frameNum, String title, String content,
                             String mood, LocalDate date) {
        Frame frame = new Frame();
        frame.user = user;
        frame.frameNum = frameNum;
        frame.title = title;
        frame.content = content;
        frame.mood = mood;
        frame.date = date;
        return frame;
    }

    public static Frame quick(User user, int frameNum, String title, String content, LocalDate date) {
        Frame frame = new Frame();
        frame.user = user;
        frame.frameNum = frameNum;
        frame.title = title;
        frame.content = content;
        frame.date = date;
        frame.frameType = FrameType.QUICK;
        return frame;
    }

    public void update(String title, String content, String mood) {
        this.title = title;
        this.content = content;
        this.mood = mood;
    }

    public void archive() { this.isArchived = true; }
    public void unarchive() { this.isArchived = false; }
    public void toggleBookmark() { this.isBookmarked = !this.isBookmarked; }
}
