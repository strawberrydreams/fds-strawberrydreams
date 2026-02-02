package kdt.project.fds.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;

/**
 * 이 파일은 리프레시 토큰 엔티티 파일이다.
 * 토큰 해시, 만료, 폐기 상태를 추적해 회전 로직에 사용한다.
 */
@Getter
@Entity
@Table(name = "REFRESH_TOKENS")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "refresh_tokens_seq")
    @SequenceGenerator(
            name = "refresh_tokens_seq",
            sequenceName = "REFRESH_TOKENS_SEQ",
            allocationSize = 1
    )
    @Column(name = "REFRESH_TOKEN_ID")
    private Long id;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "TOKEN_HASH", length = 64, nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "REVOKED_AT")
    private LocalDateTime revokedAt;

    @Column(name = "REPLACED_BY", length = 64)
    private String replacedBy;

    @Column(name = "LAST_USED_AT")
    private LocalDateTime lastUsedAt;

    @Column(name = "USER_AGENT", length = 512)
    private String userAgent;

    @Column(name = "IP_ADDRESS", length = 64)
    private String ipAddress;

    protected RefreshToken() {
    }

    public RefreshToken(
            Long userId,
            String tokenHash,
            LocalDateTime expiresAt,
            LocalDateTime createdAt,
            String userAgent,
            String ipAddress
    ) {
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
    }

    /**
     * 토큰이 만료 시간을 지났는지 확인한다.
     * 저장된 만료 시각과 전달된 시간을 비교한다.
     */
    public boolean isExpired(LocalDateTime now) {
        return expiresAt.isBefore(now);
    }

    /**
     * 토큰이 폐기되었는지 표시한다.
     * 폐기 시각을 기준으로 판단한다.
     */
    public boolean isRevoked() {
        return revokedAt != null;
    }

    /**
     * 감사 추적을 위해 마지막 사용 시간을 갱신한다.
     * 토큰이 사용될 때의 시각을 기록한다.
     */
    public void markUsed(LocalDateTime usedAt) {
        this.lastUsedAt = usedAt;
    }

    /**
     * 토큰을 폐기하고 대체 해시를 기록한다.
     * 향후 리프레시 요청에서 사용할 수 없게 만든다.
     */
    public void revoke(LocalDateTime revokedAt, String replacedBy) {
        this.revokedAt = revokedAt;
        this.replacedBy = replacedBy;
    }
}
