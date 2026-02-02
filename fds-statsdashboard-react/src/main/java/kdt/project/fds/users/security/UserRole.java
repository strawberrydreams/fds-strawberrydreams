package kdt.project.fds.users.security;

/**
 * 이 파일은 사용자 역할 열거형이다.
 * Spring Security와 호환되는 권한 문자열을 제공한다.
 */
public enum UserRole {
    ADMIN,
    USER;

    /**
     * enum을 ROLE_ 권한 문자열로 변환한다. enum 이름을 사용해 Spring Security 권한을 구성한다.
     */
    public String asAuthority() {
        return "ROLE_" + name();
    }
}
