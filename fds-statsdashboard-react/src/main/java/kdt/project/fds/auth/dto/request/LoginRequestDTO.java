package kdt.project.fds.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 이 파일은 로그인 요청 DTO 레코드 파일이다.
 * record를 사용해 DTO를 불변이면서 간결하게 유지한다.
 */
public record LoginRequestDTO(
        @NotBlank
        String userId,

        @NotBlank
        String password
) { }
