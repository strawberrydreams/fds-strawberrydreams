package kdt.project.fds.users.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import kdt.project.fds.users.security.UserRole;
import lombok.Getter;

/**
 * 이 파일은 사용자 엔티티 파일이다.
 * 식별자, 로그인 아이디, 기본 정보를 갖는 USERS 테이블을 매핑한다.
 */
@Getter
@Entity
@Table(name = "USERS")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_USER_ID")
    @SequenceGenerator(
            name = "SEQ_USER_ID",
            sequenceName = "SEQ_USER_ID",
            allocationSize = 1
    )
    @Column(name = "ID")
    private Long id;

    @Column(name = "USER_ID", length = 50, nullable = false, unique = true)
    private String userId;

    @Column(name = "USER_PW", length = 255, nullable = false)
    private String userPw;

    @Column(name = "NAME", length = 50, nullable = false)
    private String name;

    @Column(name = "USER_EMAIL", length = 100)
    private String userEmail;

    @Column(name = "BIRTH", length = 20)
    private String birth;

    @Column(name = "GENDER", length = 10)
    private String gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", length = 20)
    private UserRole role;

    @Column(name = "PW_QUESTION", length = 255)
    private String pwQuestion;

    @Column(name = "PW_ANSWER", length = 255)
    private String pwAnswer;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    protected User() {
    }

    public User(
            String userId,
            String userPw,
            String name,
            String userEmail,
            String birth,
            String gender,
            UserRole role,
            String pwQuestion,
            String pwAnswer
    ) {
        this.userId = userId;
        this.userPw = userPw;
        this.name = name;
        this.userEmail = userEmail;
        this.birth = birth;
        this.gender = gender;
        this.role = role;
        this.pwQuestion = pwQuestion;
        this.pwAnswer = pwAnswer;
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
        if (role == null) {
            role = UserRole.USER;
        }
    }
}
