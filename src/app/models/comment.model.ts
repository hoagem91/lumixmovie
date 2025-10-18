import {Movie} from "./movie.model";
import {User} from "./user.model";

export interface CommentModel{
  id:string,
  content:string,
  createdAt:string,
  updatedAt?:string,
  movieId:string,
  movieTitle:string,
  posterUrl:string,
  year:string,
  username:string,
  userId:string,
  email:string,
  parentId:string,
  parentName:string,
  replies:CommentModel[],
  likeCount:number,
  dislikeCount:number,
  userReaction:'LIKE'|'DISLIKE'|null;
}
export interface CommentReaction{
  id:string,
  commentId:string,
  userId:string,
  isLike:boolean
}
