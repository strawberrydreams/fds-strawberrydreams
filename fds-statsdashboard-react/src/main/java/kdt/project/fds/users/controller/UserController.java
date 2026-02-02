package kdt.project.fds.users.controller;

import jakarta.validation.Valid;
import kdt.project.fds.users.dto.request.UserSignupRequestDTO;
import kdt.project.fds.users.dto.response.UserSignupResponseDTO;
import kdt.project.fds.users.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 이 파일은 사용자 컨트롤러 파일이다.
 * 요청 처리를 사용자 서비스에 위임하고 API 응답을 반환한다.
 */
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 가입 정보를 바탕으로 새 사용자 계정을 만든다.
     * 요청 본문을 검증하고 생성된 사용자 id를 반환한다.
     */
    @PostMapping("/signup")
    public ResponseEntity<UserSignupResponseDTO> signup(
            @Valid @RequestBody UserSignupRequestDTO request
    ) {
        UserSignupResponseDTO response = userService.signup(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
