package com.reel.frame.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "frame_photos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FramePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frame_id", nullable = false)
    private Frame frame;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "order_num", nullable = false)
    private Integer orderNum;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static FramePhoto of(Frame frame, String fileName, int orderNum) {
        FramePhoto photo = new FramePhoto();
        photo.frame = frame;
        photo.fileName = fileName;
        photo.orderNum = orderNum;
        return photo;
    }

    public String getUrl() {
        return "/uploads/photos/" + frame.getId() + "/" + fileName;
    }
}
