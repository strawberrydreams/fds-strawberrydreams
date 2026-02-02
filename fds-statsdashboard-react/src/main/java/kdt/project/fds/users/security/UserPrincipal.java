package kdt.project.fds.users.security;

import java.util.Collection;
import java.util.List;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * 이 파일은 사용자 인증 principal 파일이다.
 * 사용자 id, 자격정보, 역할 기반 권한을 노출한다.
 */
public class UserPrincipal implements UserDetails {
    @Getter
    private final Long userId;
    private final String loginId;
    private final String password;

    @Getter
    private final UserRole role;

    public UserPrincipal(Long userId, String loginId, String password, UserRole role) {
        this.userId = userId;
        this.loginId = loginId;
        this.password = password;
        this.role = role;
    }

    /**
     * 사용자 역할에 따른 권한을 반환한다.
     * 저장된 enum 값을 기반으로 단일 ROLE_ 권한을 만든다.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.asAuthority()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return loginId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
