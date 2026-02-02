package kdt.project.fds.auth.config;

import kdt.project.fds.users.security.CustomUserDetailsService;
import kdt.project.fds.auth.security.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * 이 파일은 보안 설정 파일이다.
 * 상태 없는 JWT 인증, 엔드포인트 규칙, 비밀번호 인코딩을 설정한다.
 */
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityConfig {
    /**
     * CSRF 보호가 필요한 엔드포인트 매처를 정의한다.
     * 쿠키를 사용하는 refresh/logout 엔드포인트에만 CSRF 보호를 적용한다.
     */
    private static final RequestMatcher CSRF_PROTECTED_ENDPOINTS = request -> {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }

        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }

        return "/api/auth/refresh".equals(path) || "/api/auth/logout".equals(path);
    };

    /**
     * API 요청용 보안 필터 체인을 구성한다.
     * CSRF 규칙, 인가 정책, JWT 필터를 적용한다.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .requireCsrfProtectionMatcher(CSRF_PROTECTED_ENDPOINTS)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/static/**").permitAll()
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/csrf",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/api/users/signup"
                        ).permitAll()
                        .requestMatchers(
                                "/api/stats/user/summary",
                                "/api/stats/user/dashboard",
                                "/api/stats/snapshots/**"
                        )
                        .hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/stats/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/stats/codebook/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * UserDetailsService 기반 인증 매니저를 제공한다.
     * 설정된 비밀번호 인코더를 사용하는 DAO 제공자를 쓴다.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(List.of(provider));
    }

    /**
     * BCrypt 해시와 호환되는 비밀번호 인코더를 제공한다.
     * 알 수 없는 해시 접두사는 거부해 오동작 매칭을 방지한다.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
        return new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                return bcrypt.encode(rawPassword);
            }

            /**
             * 비밀번호 일치 여부를 검증한다.
             * BCrypt 해시 접두사($2a$, $2b$, $2y$)가 있는 경우에만 검증을 수행하고,
             * 알 수 없는 형식의 해시는 보안을 위해 항상 실패 처리한다.
             */
            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                if (encodedPassword == null || encodedPassword.isBlank()) {
                    return false;
                }

                // BCrypt 해시 형식인지 확인 (2a, 2b, 2y는 BCrypt 버전을 나타냄)
                if (encodedPassword.startsWith("$2a$")
                        || encodedPassword.startsWith("$2b$")
                        || encodedPassword.startsWith("$2y$")) {
                    return bcrypt.matches(rawPassword, encodedPassword);
                }
                // 알 수 없는 해시 형식은 보안상 거부
                return false;
            }
        };
    }
}
