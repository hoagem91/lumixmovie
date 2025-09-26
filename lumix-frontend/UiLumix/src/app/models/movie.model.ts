export interface Movie{
  id:string;
  title: string;
  posterUrl: string;
  videoUrl: string;
  description:string;
  genres:Genre[];
  directors:Director[];
  actor:Actor[];
  year:string;
  rating:string;
  duration:string;
}
export interface Genre{
  id:string;
  name:string;
  movies:Movie[];
}
export interface Director{
  id:string;
  name:string;
}
export interface Actor{
  id:string;
  name:string;
}
export interface Comment {
  id:string;
  content:string;
  createdAt:string;
  updatedAt?:string;
  userId:string;
  username:string;
}
export interface WatchHistory{
  id:string;
  userId:string;
  movie:Movie;
  progressInSeconds:number;
  lastWatchedAt:string;

}
