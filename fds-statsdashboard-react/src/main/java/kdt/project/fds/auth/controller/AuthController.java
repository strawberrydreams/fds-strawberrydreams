package kdt.project.fds.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import kdt.project.fds.auth.config.SecurityProperties;
import kdt.project.fds.auth.dto.request.LoginRequestDTO;
import kdt.project.fds.auth.dto.response.LoginResponseDTO;
import kdt.project.fds.auth.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 이 파일은 인증 컨트롤러 파일이다.
 * JWT payload와 보안 리프레시 쿠키를 포함한 HTTP 응답을 만든다.
 */
@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    /**
     * 리프레시 토큰 쿠키 이름을 정의한다.
     * 로그인/갱신/로그아웃 흐름에서 동일한 이름을 사용한다.
     */
    private static final String REFRESH_TOKEN_COOKIE = "fds_refresh_token";
    private final AuthService authService;
    private final SecurityProperties securityProperties;

    public AuthController(AuthService authService, SecurityProperties securityProperties) {
        this.authService = authService;
        this.securityProperties = securityProperties;
    }

    /**
     * 자격 증명을 인증하고 토큰 정보를 반환한다.
     * 인증 서비스를 호출하고 성공 시 리프레시 쿠키를 설정한다.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid
            @RequestBody
            LoginRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        AuthService.AuthResult result = authService.login(
                request,
                httpRequest.getHeader("User-Agent"),
                resolveIp(httpRequest)
        );
        ResponseCookie refreshCookie = buildRefreshCookie(result.refreshToken(), httpRequest);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(result.response());
    }

    /**
     * 클라이언트가 CSRF 토큰을 읽을 수 있는 엔드포인트를 제공한다.
     * 응답에 토큰을 포함하는 처리는 Spring Security에 맡긴다.
     */
    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(CsrfToken csrfToken) {
        csrfToken.getToken();
        return ResponseEntity.noContent().build();
    }

    /**
     * 리프레시 쿠키로 JWT 토큰을 갱신한다.
     * 리프레시 토큰을 교체하고 응답에 새 쿠키를 설정한다.
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false)
            String refreshToken,
            HttpServletRequest httpRequest
    ) {
        AuthService.AuthResult result = authService.refresh(
                refreshToken,
                httpRequest.getHeader("User-Agent"),
                resolveIp(httpRequest)
        );
        ResponseCookie refreshCookie = buildRefreshCookie(result.refreshToken(), httpRequest);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(result.response());
    }

    /**
     * 리프레시 토큰을 폐기하여 로그아웃한다.
     * 클라이언트의 리프레시 쿠키를 제거한다.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false)
            String refreshToken,
            HttpServletRequest httpRequest
    ) {
        authService.logout(refreshToken);
        ResponseCookie refreshCookie = clearRefreshCookie(httpRequest);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .build();
    }

    private ResponseCookie buildRefreshCookie(
            String refreshToken,
            HttpServletRequest request
    ) {
        long maxAgeSeconds = Duration.ofDays(securityProperties.getJwt().getRefreshExpirationDays()).getSeconds();
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshToken)
                .httpOnly(true)
                .secure(isSecureRequest(request))
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(maxAgeSeconds)
                .build();
    }

    private ResponseCookie clearRefreshCookie(HttpServletRequest request) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(isSecureRequest(request))
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        if (forwardedProto != null && !forwardedProto.isBlank()) {
            return "https".equalsIgnoreCase(forwardedProto.trim());
        }

        return request.isSecure();
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] parts = forwarded.split(",");
            return parts[0].trim();
        }

        return request.getRemoteAddr();
    }
}
