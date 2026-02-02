package kdt.project.fds.users.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 이 파일은 회원가입 요청 DTO 레코드 파일이다.
 * record를 사용해 DTO를 불변이면서 간결하게 유지한다.
 */
public record UserSignupRequestDTO(
        @NotBlank
        @Size(max = 50)
        String userId,

        @NotBlank
        @Size(max = 50)
        String name,

        @Email
        @Size(max = 100)
        String userEmail,

        @Size(max = 20)
        String birth,

        @Size(max = 10)
        String gender,

        @NotBlank
        @Size(min = 8, max = 255, message = "비밀번호는 8자 이상 255자 이하여야 합니다")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "비밀번호는 영문 대문자, 소문자, 숫자를 각각 1개 이상 포함해야 합니다"
        )
        String userPw,

        @Size(max = 255)
        String pwQuestion,

        @Size(max = 255)
        String pwAnswer
) {
}
