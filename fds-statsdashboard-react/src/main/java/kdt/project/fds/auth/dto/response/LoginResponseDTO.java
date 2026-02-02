package kdt.project.fds.auth.dto.response;

/**
 * 이 파일은 로그인 응답 DTO 레코드 파일이다.
 * record를 사용해 불변이고 보일러플레이트가 없는 응답 DTO를 제공한다.
 */
public record LoginResponseDTO(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String loginId,
        String role
) { }
