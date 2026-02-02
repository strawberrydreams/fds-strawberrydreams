package kdt.project.fds.other.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 이 파일은 거래 엔티티 파일이다.
 * 금액과 계좌 연결을 포함한 TRANSACTIONS 테이블을 표현한다.
 */
@Entity
@Table(name = "TRANSACTIONS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_TX_ID")
    @SequenceGenerator(name = "SEQ_TX_ID", sequenceName = "SEQ_TX_ID", allocationSize = 1)
    @Column(name = "TX_ID")
    private Long txId;

    @Column(name = "ACCOUNT_ID", nullable = false)
    private Long accountId;

    @Column(name = "TX_TYPE", length = 50, nullable = false)
    private String txType;

    @Column(name = "TX_AMOUNT", precision = 19, scale = 2, nullable = false)
    private BigDecimal txAmount;

    @Column(name = "BALANCE_AFTER_TX", precision = 19, scale = 2)
    private BigDecimal balanceAfterTx;

    @Column(name = "TARGET_ACCOUNT_NUMBER", length = 255)
    private String targetAccountNumber;

    @Column(name = "MERCHANT_NAME", length = 255)
    private String merchantName;

    @Column(name = "LOCATION", length = 255)
    private String location;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    /**
     * 기본 생성 시각을 담는 private 필드이다.
     * builder에서 createdAt을 주지 않아도 기본 시각이 남도록 한다.
     */
    @Builder.Default
    @Column(name = "TX_TIMESTAMP")
    private LocalDateTime txTimestamp = LocalDateTime.now();
}
