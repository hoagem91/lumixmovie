package com.project.lumix.mapper;

import com.project.lumix.dto.request.CommentRequest;
import com.project.lumix.dto.response.CommentResponse;
import com.project.lumix.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

@Mapper(
        componentModel = "spring"
)
public interface CommentMapper {
    Comment toComment(CommentRequest commentRequest);

    @Mappings({@Mapping(
            source = "user.username",
            target = "username"
    ), @Mapping(
            source = "user.userId",
            target = "userId"
    ), @Mapping(
            source = "user.email",
            target = "email"
    ), @Mapping(
            source = "movie",
            target = "movie"
    )})
    CommentResponse toCommentResponse(Comment comment);

    @Mappings({@Mapping(
            target = "user",
            ignore = true
    ), @Mapping(
            target = "movie",
            ignore = true
    )})
    void updateComment(@MappingTarget Comment comment, CommentRequest request);
}

