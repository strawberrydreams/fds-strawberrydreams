package kdt.project.fds.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Objects;

import kdt.project.fds.auth.config.SecurityProperties;
import kdt.project.fds.auth.entity.RefreshToken;
import kdt.project.fds.users.entity.User;
import kdt.project.fds.auth.dto.request.LoginRequestDTO;
import kdt.project.fds.auth.dto.response.LoginResponseDTO;
import kdt.project.fds.auth.repository.RefreshTokenRepository;
import kdt.project.fds.users.repository.UserRepository;
import kdt.project.fds.auth.security.JwtTokenProvider;
import kdt.project.fds.users.security.UserPrincipal;
import kdt.project.fds.users.security.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * 이 파일은 인증 서비스 파일이다.
 * 자격 증명을 검증하고 JWT를 발급하며 해시된 리프레시 토큰을 저장한다.
 */
@Service
public class AuthService {
    // 액세스 토큰 타입 문자열 상수이다. 로그인 응답의 tokenType 값으로 사용한다.
    private static final String TOKEN_TYPE = "Bearer";
    // 리프레시 토큰 생성에 사용할 바이트 길이이다. Base64 URL 인코딩 전에 랜덤 바이트를 만든다.
    private static final int REFRESH_TOKEN_BYTES = 32;
    // USER_AGENT 저장 시 최대 길이를 제한한다. 과도한 헤더 길이로 인한 저장 문제를 예방한다.
    private static final int USER_AGENT_MAX_LENGTH = 512;
    // IP_ADDRESS 저장 시 최대 길이를 제한한다. 예외적인 주소 길이를 안전하게 잘라낸다.
    private static final int IP_ADDRESS_MAX_LENGTH = 64;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final SecurityProperties securityProperties;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    // 리프레시 토큰 생성을 위한 난수 생성기이다. 매 요청마다 안전한 랜덤 값을 만들기 위해 재사용한다.
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            SecurityProperties securityProperties,
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.securityProperties = securityProperties;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    /**
     * 자격 증명을 인증하고 액세스/리프레시 토큰을 발급한다.
     * 인증 매니저와 JWT 공급자를 사용하고 리프레시 토큰 해시를 저장한다.
     */
    @Transactional
    public AuthResult login(
            LoginRequestDTO request,
            String userAgent,
            String ipAddress) {
        if (request == null || isBlank(request.userId()) || isBlank(request.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Login request is invalid");
        }

        String normalizedUserId = request.userId().trim();
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedUserId, request.password())
            );
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.createToken(Objects.requireNonNull(principal));
        long expiresIn = securityProperties.getJwt().getExpirationMinutes() * 60;
        IssuedRefreshToken refreshToken = issueRefreshToken(
                principal.getUserId(),
                userAgent,
                ipAddress,
                LocalDateTime.now()
        );

        return new AuthResult(new LoginResponseDTO(
                token,
                TOKEN_TYPE,
                expiresIn,
                principal.getUserId(),
                principal.getUsername(),
                principal.getRole().name()
        ), refreshToken.rawToken());
    }

    /**
     * 리프레시 토큰을 교체하고 새 액세스 토큰을 발급한다.
     * 현재 토큰을 검증한 뒤 폐기하고 새 토큰 해시를 저장한다.
     */
    @Transactional
    public AuthResult refresh(
            String rawRefreshToken,
            String userAgent,
            String ipAddress) {
        LocalDateTime now = LocalDateTime.now();
        RefreshToken stored = getActiveRefreshToken(rawRefreshToken, now);
        stored.markUsed(now);
        IssuedRefreshToken rotated = issueRefreshToken(
                stored.getUserId(),
                userAgent,
                ipAddress,
                now
        );
        stored.revoke(now, rotated.hash());
        refreshTokenRepository.save(stored);

        UserPrincipal principal = loadPrincipal(stored.getUserId());
        String accessToken = tokenProvider.createToken(principal);
        long expiresIn = securityProperties.getJwt().getExpirationMinutes() * 60;

        return new AuthResult(new LoginResponseDTO(
                accessToken,
                TOKEN_TYPE,
                expiresIn,
                principal.getUserId(),
                principal.getUsername(),
                principal.getRole().name()
        ), rotated.rawToken());
    }

    /**
     * 리프레시 토큰이 있으면 폐기한다.
     * 저장된 토큰을 사용/폐기 상태로 표시해 재사용을 막는다.
     */
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        String hash = hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            if (!token.isRevoked()) {
                LocalDateTime now = LocalDateTime.now();
                token.markUsed(now);
                token.revoke(now, null);
                refreshTokenRepository.save(token);
            }
        });
    }

    /**
     * 원문 리프레시 토큰을 검증하고 유효한 토큰 엔티티를 반환한다.
     * 해시 변환 후 DB 조회, 폐기/만료 여부를 순차적으로 확인한다.
     */
    private RefreshToken getActiveRefreshToken(
            String rawRefreshToken,
            LocalDateTime now) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is missing");
        }

        String hash = hashToken(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid"));

        if (token.isRevoked()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is revoked");
        }

        if (token.isExpired(now)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is expired");
        }

        return token;
    }

    /**
     * 사용자 ID로 DB에서 사용자를 조회하고 인증 principal을 생성한다.
     * 리프레시 토큰 갱신 시 최신 사용자 정보로 새 액세스 토큰을 발급하기 위해 사용한다.
     */
    private UserPrincipal loadPrincipal(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        UserRole role = resolveRole(user);

        return new UserPrincipal(user.getId(), user.getUserId(), "", role);
    }

    /**
     * 사용자 역할을 안전하게 추출한다.
     * null인 경우 기본값 USER를 반환하여 NPE를 방지한다.
     */
    private UserRole resolveRole(User user) {
        if (user == null || user.getRole() == null) {
            return UserRole.USER;
        }
        return user.getRole();
    }

    /**
     * 새 리프레시 토큰을 생성하고 DB에 저장한다.
     * 토큰 원문과 해시를 함께 반환하여 클라이언트 전달 및 회전 추적에 사용한다.
     */
    private IssuedRefreshToken issueRefreshToken(
            Long userId,
            String userAgent,
            String ipAddress,
            LocalDateTime now
    ) {
        String rawToken = generateRefreshToken();
        String hash = hashToken(rawToken);
        LocalDateTime expiresAt = now.plusDays(securityProperties.getJwt().getRefreshExpirationDays());
        RefreshToken token = new RefreshToken(
                userId,
                hash,
                expiresAt,
                now,
                limit(userAgent, USER_AGENT_MAX_LENGTH),
                limit(ipAddress, IP_ADDRESS_MAX_LENGTH)
        );
        refreshTokenRepository.save(token);

        return new IssuedRefreshToken(rawToken, hash);
    }

    /**
     * 암호학적으로 안전한 랜덤 리프레시 토큰을 생성한다.
     * 32바이트 랜덤 값을 Base64 URL 인코딩하여 클라이언트에 전달할 토큰을 만든다.
     */
    private String generateRefreshToken() {
        byte[] tokenBytes = new byte[REFRESH_TOKEN_BYTES];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    /**
     * 리프레시 토큰을 SHA-256으로 해시하여 DB 저장용 값을 생성한다.
     * 원문 토큰 대신 해시를 저장해 토큰 유출 시 피해를 최소화한다.
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();

        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * 내부 토큰 발급 결과를 담는 private 레코드이다.
     * 원문 토큰과 해시 값을 함께 전달한다.
     */
    private record IssuedRefreshToken(String rawToken, String hash) {
    }

    public record AuthResult(LoginResponseDTO response, String refreshToken) {
    }
}
