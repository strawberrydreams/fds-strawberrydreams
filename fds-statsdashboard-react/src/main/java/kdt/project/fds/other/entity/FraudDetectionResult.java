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
 * 이 파일은 사기 탐지 결과 엔티티 파일이다.
 * 모델 확률, 엔진명, 타임스탬프를 저장한다.
 */
@Setter
@Getter
@Entity
@Table(name = "FRAUD_DETECTION_RESULTS")
public class FraudDetectionResult {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_DETECTION_ID")
    @SequenceGenerator(
            name = "SEQ_DETECTION_ID",
            sequenceName = "SEQ_DETECTION_ID",
            allocationSize = 1
    )
    @Column(name = "DETECTION_ID")
    private Long detectionId;

    @Column(name = "TX_ID", nullable = false, unique = true)
    private Long txId;

    @Column(name = "FRAUD_PROBABILITY")
    private Double fraudProbability;

    @Column(name = "IS_FRAUD")
    private Integer isFraud;

    @Column(name = "DETECTED_ENGINE", length = 50)
    private String detectedEngine;

    @Column(name = "THRESHOLD_VALUE")
    private Double thresholdValue;

    @Column(name = "ACTION_TAKEN", length = 20)
    private String actionTaken;

    @Column(name = "DETECTED_AT")
    private LocalDateTime detectedAt;

    protected FraudDetectionResult() {
    }

    /**
     * 삽입 시 탐지 시각을 초기화한다.
     * persist 시 DETECTED_AT가 설정되도록 한다.
     */
    @PrePersist
    private void onCreate() {
        if (detectedAt == null) {
            detectedAt = LocalDateTime.now();
        }
    }
}
