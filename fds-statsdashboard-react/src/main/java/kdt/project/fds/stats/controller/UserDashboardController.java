package kdt.project.fds.stats.controller;

import java.time.LocalDate;
import kdt.project.fds.stats.dto.response.AdminDashboardResponseDTO;
import kdt.project.fds.stats.dto.response.UserDashboardResponseDTO;
import kdt.project.fds.stats.dto.response.UserSummaryResponseDTO;
import kdt.project.fds.stats.service.AdminStatsDashboardService;
import kdt.project.fds.stats.service.UserStatsDashboardService;
import kdt.project.fds.stats.vo.StatsRangeType;
import kdt.project.fds.users.security.UserPrincipal;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 이 파일은 통계 대시보드 컨트롤러 파일이다.
 * 사용자/관리자 대시보드 데이터를 조회하는 엔드포인트를 제공한다.
 */
@RestController
@RequestMapping("/api/stats")
@Validated
public class UserDashboardController {
    private final UserStatsDashboardService userDashboardService;
    private final AdminStatsDashboardService adminDashboardService;

    public UserDashboardController(
            UserStatsDashboardService userDashboardService,
            AdminStatsDashboardService adminDashboardService
    ) {
        this.userDashboardService = userDashboardService;
        this.adminDashboardService = adminDashboardService;
    }

    /**
     * 실시간 개인 요약 KPI를 반환한다.
     * today/last_7_days 범위를 지원한다.
     */
    @GetMapping("/user/summary")
    public UserSummaryResponseDTO getUserSummary(
            @AuthenticationPrincipal
            UserPrincipal principal,
            @RequestParam(defaultValue = "LAST_7_DAYS")
            StatsRangeType range
    ) {
        return userDashboardService.getUserSummary(principal.getUserId(), range);
    }

    /**
     * 사용자 대시보드 상세 정보를 반환한다.
     * 거래/탐지 요약은 range 필터를 따른다.
     */
    @GetMapping("/user/dashboard")
    public UserDashboardResponseDTO getUserDashboard(
            @AuthenticationPrincipal
            UserPrincipal principal,
            @RequestParam(defaultValue = "LAST_7_DAYS")
            StatsRangeType range
    ) {
        return userDashboardService.getUserDashboard(principal.getUserId(), range);
    }

    /**
     * 관리자 대시보드 집계 데이터를 반환한다.
     * 날짜 범위를 지정하지 않으면 최근 7일을 사용한다.
     */
    @GetMapping("/admin/dashboard")
    public AdminDashboardResponseDTO getAdminDashboard(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        return adminDashboardService.getAdminDashboard(fromDate, toDate);
    }
}
