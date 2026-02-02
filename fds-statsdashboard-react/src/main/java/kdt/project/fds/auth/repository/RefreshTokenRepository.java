package kdt.project.fds.auth.repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.Optional;
import kdt.project.fds.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 이 파일은 리프레시 토큰 리포지토리 파일이다.
 * 동시 재사용을 막기 위해 토큰 해시 조회에 잠금을 제공한다.
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    // 해시로 리프레시 토큰을 쓰기 잠금으로 조회한다. 회전/폐기 업데이트가 직렬화되도록 보장한다.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // 지정된 시각 이전에 만료된 토큰을 삭제한다. 스케줄러에서 정리 작업에 사용한다.
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :cutoff")
    int deleteExpiredTokensBefore(@Param("cutoff") LocalDateTime cutoff);
}
