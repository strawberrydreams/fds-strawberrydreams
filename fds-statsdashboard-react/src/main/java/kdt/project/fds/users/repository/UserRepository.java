package kdt.project.fds.users.repository;

import java.util.Optional;
import kdt.project.fds.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 이 파일은 사용자 리포지토리 파일이다.
 * 인증 및 가입 확인을 위한 로그인 아이디/이메일 조회를 지원한다.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    // 고유 로그인 아이디로 사용자를 조회한다. 일치하는 사용자가 없으면 빈 결과를 반환한다.
    Optional<User> findByUserId(String userId);
    // 이메일이 존재한다면 중복 가입 여부를 확인한다.
    Optional<User> findByUserEmail(String userEmail);
}
