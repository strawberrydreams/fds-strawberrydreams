package kdt.project.fds.users.service;

import kdt.project.fds.users.entity.User;
import kdt.project.fds.users.dto.request.UserSignupRequestDTO;
import kdt.project.fds.users.dto.response.UserSignupResponseDTO;
import kdt.project.fds.users.repository.UserRepository;
import kdt.project.fds.users.security.UserRole;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * 이 파일은 사용자 서비스 파일이다.
 * 입력을 검증하고 비밀값을 인코딩해 새 사용자 기록을 저장한다.
 */
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 새 사용자를 등록하고 id를 반환한다.
     * 입력을 정규화하고 비밀값을 인코딩한 뒤 사용자 엔티티를 저장한다.
     */
    @Transactional
    public UserSignupResponseDTO signup(UserSignupRequestDTO request) {
        String userId = requireText(request.userId(), "userId");
        String rawPassword = requireText(request.userPw(), "userPw");
        String name = requireText(request.name(), "name");
        String userEmail = trimToNull(request.userEmail());

        if (userRepository.findByUserId(userId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User ID already exists");
        }

        if (userEmail != null && userRepository.findByUserEmail(userEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User email already exists");
        }
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User user = new User(
                userId,
                encodedPassword,
                name,
                userEmail,
                trimToNull(request.birth()),
                trimToNull(request.gender()),
                UserRole.USER,
                trimToNull(request.pwQuestion()),
                trimToNull(request.pwAnswer())
        );
        User saved;

        try {
            saved = userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists", ex);
        }

        return new UserSignupResponseDTO(saved.getId());
    }

    /**
     * 필수 텍스트 필드를 검증하고 공백을 제거한다.
     * null이거나 빈 문자열이면 400 에러를 발생시킨다.
     */
    private String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value.trim();
    }

    /**
     * 선택 텍스트 필드를 정규화한다.
     * 공백만 있거나 빈 문자열은 null로 변환하여 DB에 일관되게 저장한다.
     */
    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }
}
