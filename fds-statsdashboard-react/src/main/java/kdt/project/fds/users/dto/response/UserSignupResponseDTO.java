package kdt.project.fds.users.dto.response;

/**
 * 이 파일은 회원가입 응답 DTO 레코드 파일이다.
 * record를 사용해 불변이고 보일러플레이트가 없는 응답 DTO를 제공한다.
 */
public record UserSignupResponseDTO(
        Long userId
) { }
