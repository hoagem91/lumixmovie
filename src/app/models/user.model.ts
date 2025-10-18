export interface User {
  userId: string;
  username: string;
  email:string;
  createdAt:string;
  roles:Role[];
}
export interface Role{
  name:string;
}
