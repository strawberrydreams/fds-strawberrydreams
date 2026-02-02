package kdt.project.fds.auth.config;

import java.time.LocalDateTime;
import kdt.project.fds.auth.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 이 파일은 리프레시 토큰 정리 스케줄러 파일이다.
 * 만료된 리프레시 토큰을 주기적으로 삭제하여 테이블 크기를 관리한다.
 */
@Component
public class RefreshTokenCleanupScheduler {
    private static final Logger log = LoggerFactory.getLogger(RefreshTokenCleanupScheduler.class);

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenCleanupScheduler(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * 매일 새벽 3시에 만료된 리프레시 토큰을 삭제한다.
     * Asia/Seoul 시간대 기준으로 실행된다.
     */
    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = refreshTokenRepository.deleteExpiredTokensBefore(now);
        if (deletedCount > 0) {
            log.info("Deleted {} expired refresh tokens", deletedCount);
        }
    }
}
