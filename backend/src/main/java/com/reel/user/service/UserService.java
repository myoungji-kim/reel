package com.reel.user.service;

import com.reel.common.exception.ErrorCode;
import com.reel.common.exception.ReelException;
import com.reel.user.dto.StreakResponse;
import com.reel.user.entity.User;
import com.reel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public StreakResponse getStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ReelException(ErrorCode.USER_NOT_FOUND));
        boolean recordedToday = LocalDate.now().equals(user.getLastFrameDate());
        return new StreakResponse(user.getStreakCount(), user.getLastFrameDate(), recordedToday);
    }
}
