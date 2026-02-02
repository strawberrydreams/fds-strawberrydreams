package kdt.project.fds.other.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * 이 파일은 FDS 설정 엔티티 파일이다.
 * 시스템 설정 키/값을 저장한다.
 */
@Setter
@Getter
@Entity
@Table(name = "FDS_CONFIG")
public class FdsConfig {
    @Id
    @Column(name = "CONFIG_KEY", length = 255)
    private String configKey;

    @Column(name = "CONFIG_VALUE", length = 255, nullable = false)
    private String configValue;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    protected FdsConfig() {
    }
}
