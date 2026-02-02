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
 * 이 파일은 카드 엔티티 파일이다.
 * 카드 기본 정보와 계좌 연결을 저장한다.
 */
@Setter
@Getter
@Entity
@Table(name = "CARDS")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_CARD_ID")
    @SequenceGenerator(
            name = "SEQ_CARD_ID",
            sequenceName = "SEQ_CARD_ID",
            allocationSize = 1
    )
    @Column(name = "CARD_ID")
    private Long cardId;

    @Column(name = "CARD_NUMBER", length = 20, nullable = false, unique = true)
    private String cardNumber;

    @Column(name = "CARD_TYPE", length = 50, nullable = false)
    private String cardType;

    @Column(name = "USER_INNER_ID", nullable = false)
    private Long userInnerId;

    @Column(name = "ACCOUNT_ID", nullable = false)
    private Long accountId;

    @Column(name = "ISSUER", length = 100)
    private String issuer;

    @Column(name = "STATUS", length = 50)
    private String status;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    protected Card() {
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
