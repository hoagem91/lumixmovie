import {Movie} from "./movie.model";
import {User} from "./user.model";

export interface CommentModel{
  id:string,
  content:string,
  createdAt:string,
  updatedAt?:string,
  movie:Movie,
  username:string,
  userId:string,
  email:string
}
