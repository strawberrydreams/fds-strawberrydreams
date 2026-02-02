package kdt.project.fds.stats.controller;

import java.util.List;
import kdt.project.fds.stats.dto.response.StatsSnapshotMetadataDTO;
import kdt.project.fds.stats.service.StatsSnapshotService;
import kdt.project.fds.stats.vo.SnapshotScope;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 이 파일은 사용자용 스냅샷 컨트롤러 파일이다.
 * 주간 스냅샷 목록과 상세 JSON을 제공한다.
 */
@RestController
@RequestMapping("/api/stats/snapshots")
@Validated
public class UserSnapshotController {
    private final StatsSnapshotService statsSnapshotService;

    public UserSnapshotController(StatsSnapshotService statsSnapshotService) {
        this.statsSnapshotService = statsSnapshotService;
    }

    /**
     * 사용자용 주간 스냅샷 목록을 반환한다.
     * 일반 스냅샷 파일 메타데이터를 조회한다.
     */
    @GetMapping
    public List<StatsSnapshotMetadataDTO> list() {
        return statsSnapshotService.listSnapshots(SnapshotScope.GENERAL);
    }

    /**
     * 사용자용 스냅샷 상세 JSON을 반환한다.
     * 주차 id에 해당하는 스냅샷 파일을 읽는다.
     */
    @GetMapping("/{snapshotId}")
    public Object detail(@PathVariable String snapshotId) {
        String filename = statsSnapshotService.listSnapshots(SnapshotScope.GENERAL).stream()
                .filter(s -> s.snapshotId().equals(snapshotId))
                .map(StatsSnapshotMetadataDTO::filename)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Snapshot not found"));
        return statsSnapshotService.getSnapshotDetailByFilename(SnapshotScope.GENERAL, filename);
    }
}
