package com.project.lumix.dto.request;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class GenreRequest {
    private String id;
    @Column(
            unique = true,
            nullable = false
    )
    private String name;
}
