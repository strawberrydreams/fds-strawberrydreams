package kdt.project.fds.other.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * 이 파일은 계좌 엔티티 파일이다.
 * 조인과 데모 데이터에 필요한 ACCOUNTS 테이블 컬럼을 반영한다.
 */
@Setter
@Getter
@Entity
@Table(name = "ACCOUNTS")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_ACCOUNT_ID")
    @SequenceGenerator(
            name = "SEQ_ACCOUNT_ID",
            sequenceName = "SEQ_ACCOUNT_ID",
            allocationSize = 1
    )
    @Column(name = "ACCOUNT_ID")
    private Long accountId;

    @Column(name = "ACCOUNT_NUMBER", length = 30, nullable = false, unique = true)
    private String accountNumber;

    @Column(name = "USER_INNER_ID", nullable = false)
    private Long userInnerId;

    @Column(name = "BALANCE", precision = 19, scale = 2)
    private BigDecimal balance;

    @Column(name = "PASSWORD", length = 100, nullable = false)
    private String password;

    @Column(name = "STATUS", length = 50)
    private String status;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    protected Account() {
    }

    /**
     * 생성 시각이 없으면 초기화한다.
     * persist 시 CREATED_AT를 채우기 위해 실행한다.
     */
    @PrePersist
    private void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
