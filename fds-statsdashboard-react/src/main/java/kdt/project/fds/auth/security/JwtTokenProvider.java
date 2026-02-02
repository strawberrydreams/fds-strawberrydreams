package kdt.project.fds.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import kdt.project.fds.auth.config.SecurityProperties;
import kdt.project.fds.users.security.UserPrincipal;
import kdt.project.fds.users.security.UserRole;
import org.springframework.stereotype.Component;

/**
 * 이 파일은 JWT 토큰 제공자 파일이다.
 * 설정된 시크릿으로 토큰을 서명하고 사용자 식별 클레임을 추출한다.
 */
@Component
public class JwtTokenProvider {
    // JWT에 저장하는 역할 클레임 키를 정의한다. 토큰 파싱 시 동일한 키로 역할을 조회한다.
    private static final String CLAIM_ROLE = "role";
    // JWT에 저장하는 사용자 id 클레임 키를 정의한다. 토큰 파싱 시 동일한 키로 사용자 id를 조회한다.
    private static final String CLAIM_USER_ID = "uid";
    private final SecurityProperties securityProperties;
    private final Key signingKey;

    public JwtTokenProvider(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
        this.signingKey = buildSigningKey(securityProperties);
    }

    /**
     * 인증된 주체에 대한 서명된 JWT를 생성한다.
     * 사용자 id와 역할 클레임을 추가하고 만료 시간을 설정한다.
     */
    public String createToken(UserPrincipal principal) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(securityProperties.getJwt().getExpirationMinutes() * 60);
        return Jwts.builder()
                .setSubject(principal.getUsername())
                .claim(CLAIM_USER_ID, principal.getUserId())
                .claim(CLAIM_ROLE, principal.getRole().name())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 토큰 형식과 서명이 올바른지 확인한다.
     * 토큰을 파싱하며 JWT/인자 오류가 발생하면 false를 반환한다.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    /**
     * 검증된 토큰에서 UserPrincipal을 생성한다.
     * subject와 role 클레임을 읽어 principal로 매핑한다.
     */
    public UserPrincipal getPrincipal(String token) {
        Claims claims = parseClaims(token);
        Long userId = claims.get(CLAIM_USER_ID, Long.class);
        String loginId = claims.getSubject();
        String roleValue = claims.get(CLAIM_ROLE, String.class);
        if (userId == null || loginId == null || loginId.isBlank()) {
            throw new JwtException("JWT claims are missing");
        }

        UserRole role = UserRole.USER;
        if (roleValue != null) {
            try {
                role = UserRole.valueOf(roleValue);
            } catch (IllegalArgumentException ex) {
                throw new JwtException("JWT role claim is invalid", ex);
            }
        }

        return new UserPrincipal(userId, loginId, "", role);
    }

    /**
     * JWT를 파싱하여 클레임을 추출한다.
     * 서명 검증 실패 시 JwtException이 발생한다.
     */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 설정된 시크릿으로 HMAC-SHA256 서명 키를 생성한다.
     * 시크릿이 없거나 32바이트 미만이면 애플리케이션 시작을 중단한다.
     */
    private Key buildSigningKey(SecurityProperties properties) {
        String secret = properties.getJwt().getSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("fds.security.jwt.secret is required");
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "fds.security.jwt.secret must be at least 32 bytes for HS256. " +
                    "Current length: " + keyBytes.length + " bytes"
            );
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
