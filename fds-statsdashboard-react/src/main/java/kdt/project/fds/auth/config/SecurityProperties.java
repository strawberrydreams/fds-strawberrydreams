package kdt.project.fds.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 이 파일은 보안 설정 프로퍼티 파일이다.
 * 인증 구성 요소에서 사용하는 JWT 관련 설정을 노출한다.
 * 현재 설정은 application.properties의 fds.security 부분에 위치한다.
 */
@Getter
@ConfigurationProperties(prefix = "fds.security")
public class SecurityProperties {
    // JWT 관련 설정을 묶는 private 필드이다. 하위 설정을 한 곳에서 주입받기 위해 사용한다.
    private final Jwt jwt = new Jwt();

    @Setter
    @Getter
    public static class Jwt {
        private String secret;
        // 액세스 토큰 만료 시간을 분 단위로 정의한다. 로그인 응답의 expiresIn 계산에 사용한다.
        private long expirationMinutes = 15;
        // 리프레시 토큰 만료 시간을 일 단위로 정의한다. 회전 정책과 쿠키 만료 계산에 사용한다.
        private long refreshExpirationDays = 14;
    }
}
