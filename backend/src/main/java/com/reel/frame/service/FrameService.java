package com.reel.frame.service;

import com.reel.chat.repository.ChatSessionRepository;
import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.frame.dto.FrameResponse;
import com.reel.frame.dto.SaveFrameRequest;
import com.reel.frame.entity.Frame;
import com.reel.frame.repository.FrameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FrameService {

    private final FrameRepository frameRepository;
    private final ChatSessionRepository sessionRepository;

    @Transactional
    public FrameResponse save(Long userId, Long frameId, SaveFrameRequest request) {
        Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));

        frame.update(request.title(), request.content());

        if (frame.getSession() != null) {
            frame.getSession().markDeveloped();
            sessionRepository.save(frame.getSession());
        }

        return FrameResponse.from(frame);
    }

    @Transactional(readOnly = true)
    public Page<FrameResponse> getFrames(Long userId, int page, int size) {
        return frameRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(FrameResponse::from);
    }

    @Transactional(readOnly = true)
    public FrameResponse getFrame(Long userId, Long frameId) {
        Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
                .orElseThrow(() -> new ReelException(ErrorCode.FRAME_NOT_FOUND));
        return FrameResponse.from(frame);
    }
}
