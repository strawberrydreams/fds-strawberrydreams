package kdt.project.fds.stats.controller;

import jakarta.validation.Valid;
import java.util.List;
import kdt.project.fds.stats.dto.request.StatsSnapshotGenerateRequestDTO;
import kdt.project.fds.stats.dto.response.StatsSnapshotMetadataDTO;
import kdt.project.fds.stats.dto.response.StatsSnapshotGenerateResponseDTO;
import kdt.project.fds.stats.service.StatsSnapshotService;
import kdt.project.fds.stats.vo.SnapshotScope;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 이 파일은 관리자용 스냅샷 컨트롤러 파일이다.
 * 관리자용 스냅샷 생성과 조회를 제공한다. Admin API를 다른 API와 비교해서 관리자만 접속할 수 있도록 제한한다.
 */
@RestController
@RequestMapping("/api/stats/admin/snapshots")
@Validated
public class AdminSnapshotController {
    private final StatsSnapshotService statsSnapshotService;

    public AdminSnapshotController(StatsSnapshotService statsSnapshotService) {
        this.statsSnapshotService = statsSnapshotService;
    }

    /**
     * 주어진 기간의 스냅샷 생성을 트리거한다.
     * 요청을 스냅샷 서비스에 전달하고 결과를 반환한다.
     */
    @PostMapping({ "", "/generate" })
    public StatsSnapshotGenerateResponseDTO generate(
            @Valid
            @RequestBody
            StatsSnapshotGenerateRequestDTO request
    ) {
        return statsSnapshotService.generate(request);
    }

    /**
     * 관리자용 스냅샷 목록을 반환한다.
     * 비즈니스 스냅샷 파일 메타데이터를 조회한다.
     */
    @GetMapping
    public List<StatsSnapshotMetadataDTO> list() {
        return statsSnapshotService.listSnapshots(SnapshotScope.BUSINESS);
    }

    /**
     * 관리자용 스냅샷 상세 JSON을 반환한다.
     * 주차 id에 해당하는 스냅샷 파일을 읽는다.
     */
    @GetMapping("/{snapshotId}")
    public Object detail(@PathVariable String snapshotId) {
        String filename = statsSnapshotService.listSnapshots(SnapshotScope.BUSINESS).stream()
                .filter(s -> s.snapshotId().equals(snapshotId))
                .map(StatsSnapshotMetadataDTO::filename)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Snapshot not found"));
        return statsSnapshotService.getSnapshotDetailByFilename(SnapshotScope.BUSINESS, filename);
    }
}
