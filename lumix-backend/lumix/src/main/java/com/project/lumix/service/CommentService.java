package com.project.lumix.service;

import com.project.lumix.dto.request.CommentRequest;
import com.project.lumix.dto.request.CommentSearchRequest;
import com.project.lumix.dto.request.DeleteCommentRequest;
import com.project.lumix.dto.response.CommentResponse;
import com.project.lumix.entity.Comment;
import com.project.lumix.entity.Movie;
import com.project.lumix.entity.User;
import com.project.lumix.exception.AppException;
import com.project.lumix.exception.ErrorCode;
import com.project.lumix.mapper.CommentMapper;
import com.project.lumix.repository.CommentRepository;
import com.project.lumix.repository.MovieRepository;
import com.project.lumix.repository.UserRepository;
import com.project.lumix.specification.CommentSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    public List<CommentResponse> getAllComment() {
        return commentRepository.findAll()
                .stream()
                .map(commentMapper::toCommentResponse)
                .toList();
    }

    public List<CommentResponse> getCommentsForMovie(String movieId) {
        return commentRepository.findByMovieIdOrderByCreatedAtDesc(movieId)
                .stream()
                .map(commentMapper::toCommentResponse)
                .toList();
    }

    public CommentResponse addCommentToMovie(String movieId, CommentRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_EXISTED));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setMovie(movie);
        comment.setUser(user);

        Comment saved = commentRepository.save(comment);
        return commentMapper.toCommentResponse(saved);
    }

    public CommentResponse updateCommentToMovie(String commentId, CommentRequest request) {
        Comment comment = checkOwnershipAndGetComment(commentId);
        commentMapper.updateComment(comment, request);
        Comment updated = commentRepository.save(comment);
        return commentMapper.toCommentResponse(updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public CommentResponse updateCommentToMovieForAdmin(String commentId, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        commentMapper.updateComment(comment, request);
        Comment updated = commentRepository.save(comment);
        return commentMapper.toCommentResponse(updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCommentForAdmin(DeleteCommentRequest request) {
        for (String commentId : request.getCommentsIds()) {
            if (!commentRepository.existsById(commentId)) {
                throw new AppException(ErrorCode.COMMENT_NOT_FOUND);
            }
        }
        commentRepository.deleteAllById(request.getCommentsIds());
    }

    public void deleteComment(String commentId) {
        Comment comment = checkOwnershipAndGetComment(commentId);
        commentRepository.delete(comment);
    }

    public List<CommentResponse> searchComment(CommentSearchRequest request) {
        Specification<Comment> spec = CommentSpecification.fromRequest(request);
        return commentRepository.findAll(spec)
                .stream()
                .map(commentMapper::toCommentResponse)
                .toList();
    }

    private Comment checkOwnershipAndGetComment(String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!comment.getUser().getUsername().equals(currentUsername)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return comment;
    }
}

