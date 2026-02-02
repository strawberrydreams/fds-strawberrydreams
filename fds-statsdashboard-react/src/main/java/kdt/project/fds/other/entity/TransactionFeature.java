package kdt.project.fds.other.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/**
 * 이 파일은 거래 특징값 엔티티 파일이다.
 * 거래별 모델 입력 특징값을 저장한다.
 */
@Setter
@Getter
@Entity
@Table(name = "TRANSACTION_FEATURES")
public class TransactionFeature {
    @Id
    @Column(name = "TX_ID")
    private Long txId;

    @Column(name = "OLD_BALANCE_ORG", precision = 19, scale = 2)
    private BigDecimal oldBalanceOrg;

    @Column(name = "NEW_BALANCE_ORG", precision = 19, scale = 2)
    private BigDecimal newBalanceOrg;

    @Column(name = "OLD_BALANCE_DEST", precision = 19, scale = 2)
    private BigDecimal oldBalanceDest;

    @Column(name = "NEW_BALANCE_DEST", precision = 19, scale = 2)
    private BigDecimal newBalanceDest;

    @Column(name = "ERROR_BALANCE", precision = 19, scale = 2)
    private BigDecimal errorBalance;

    @Lob
    @Column(name = "V_FEATURES")
    private String vFeatures;

    protected TransactionFeature() {
    }
}
