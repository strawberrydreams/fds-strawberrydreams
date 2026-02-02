package kdt.project.fds.users.security;

import kdt.project.fds.users.entity.User;
import kdt.project.fds.users.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * 이 파일은 사용자 상세 서비스 파일이다.
 * 로그인 아이디로 사용자 레코드를 조회해 UserDetails로 매핑한다.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 인증을 위해 로그인 아이디로 사용자 상세 정보를 로드한다.
     * 입력을 검증하고 사용자 엔티티를 principal로 변환한다.
     */
    @Override
    public UserDetails loadUserByUsername(String username) {
        if (username.isBlank()) {
            throw new UsernameNotFoundException("User ID is required");
        }

        String normalized = username.trim();
        User user = userRepository.findByUserId(normalized)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        UserRole role = resolveRole(user);

        return new UserPrincipal(user.getId(), user.getUserId(), user.getUserPw(), role);
    }

    /**
     * 사용자 역할을 안전하게 추출한다.
     * 역할이 지정되지 않은 기존 사용자를 위해 기본값 USER를 반환한다.
     */
    private UserRole resolveRole(User user) {
        if (user == null || user.getRole() == null) {
            return UserRole.USER;
        }
        return user.getRole();
    }
}
