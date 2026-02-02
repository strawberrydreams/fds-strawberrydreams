package kdt.project.fds.other.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * 이 파일은 블랙리스트 계좌 엔티티 파일이다.
 * 차단 계좌와 사유, 차단 시각을 저장한다.
 */
@Setter
@Getter
@Entity
@Table(name = "BLACKLIST_ACCOUNTS")
public class BlacklistAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BLACKLIST_ID")
    private Long blacklistId;

    @Column(name = "ACCOUNT_NUMBER", nullable = false, unique = true)
    private String accountNumber;

    @Column(name = "REASON")
    private String reason;

    @Column(name = "BLOCKED_AT")
    private LocalDateTime blockedAt;

    protected BlacklistAccount() {
    }

    /**
     * 차단 시각이 없으면 현재 시각으로 채운다.
     * persist 시 BLOCKED_AT를 설정한다.
     */
    @PrePersist
    private void onCreate() {
        if (blockedAt == null) {
            blockedAt = LocalDateTime.now();
        }
    }
}
