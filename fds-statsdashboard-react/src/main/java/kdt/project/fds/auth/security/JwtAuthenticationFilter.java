package kdt.project.fds.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.JwtException;
import java.io.IOException;
import kdt.project.fds.users.security.UserPrincipal;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * 이 파일은 JWT 인증 필터 파일이다.
 * Bearer 토큰을 추출해 유효하면 SecurityContext에 설정한다.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    /**
     * 인증 토큰이 담기는 Authorization 헤더 이름이다.
     * 요청에서 토큰을 찾을 때 사용한다.
     */
    private static final String AUTHORIZATION_HEADER = "Authorization";
    /**
     * Bearer 인증 접두사를 정의한다.
     * 헤더 값에서 토큰 본문을 분리하는 데 사용한다.
     */
    private static final String BEARER_PREFIX = "Bearer ";
    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    /**
     * JWT 헤더로부터 인증 정보를 설정하도록 요청을 처리한다.
     * 유효한 토큰이면 보안 컨텍스트에 인증 principal을 만든다.
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            @NonNull
            HttpServletResponse response,
            @NonNull
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader(AUTHORIZATION_HEADER);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            String token = header.substring(BEARER_PREFIX.length());
            if (tokenProvider.validateToken(token)) {
                try {
                    UserPrincipal principal = tokenProvider.getPrincipal(token);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    principal,
                                    null,
                                    principal.getAuthorities()
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (JwtException | IllegalArgumentException ex) {
                    SecurityContextHolder.clearContext();
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
