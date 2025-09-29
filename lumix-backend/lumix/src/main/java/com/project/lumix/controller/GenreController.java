package com.project.lumix.controller;
import java.util.List;

import com.project.lumix.dto.response.ApiResponse;
import com.project.lumix.dto.response.GenreResponse;
import com.project.lumix.service.MovieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/movie/genre"})
@RequiredArgsConstructor
@Slf4j
public class GenreController {
    private final MovieService movieService;

    @GetMapping
    ApiResponse<List<GenreResponse>> getGenre() {
        log.info("Get all genres");
        return ApiResponse.<List<GenreResponse>>builder()
                .result(this.movieService.getGenre())
                .build();
    }
}