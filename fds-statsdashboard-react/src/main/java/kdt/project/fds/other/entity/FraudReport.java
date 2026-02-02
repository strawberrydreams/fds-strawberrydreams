package kdt.project.fds.other.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * 이 파일은 사기 신고 엔티티 파일이다.
 * 분석 조인을 위해 신고 상태와 시각을 저장한다.
 */
@Setter
@Getter
@Entity
@Table(name = "FRAUD_REPORTS")
public class FraudReport {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_REPORT_ID")
    @SequenceGenerator(
            name = "SEQ_REPORT_ID",
            sequenceName = "SEQ_REPORT_ID",
            allocationSize = 1
    )
    @Column(name = "REPORT_ID")
    private Long reportId;

    @Column(name = "ACCOUNT_NUMBER", length = 50, nullable = false)
    private String accountNumber;

    @Column(name = "REPORTER_ID")
    private Long reporterId;

    @Column(name = "REASON", length = 1000)
    private String reason;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    protected FraudReport() {
    }

    /**
     * 삽입 시 생성 시각을 초기화한다.
     * persist 시 CREATED_AT가 설정되도록 한다.
     */
    @PrePersist
    private void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
