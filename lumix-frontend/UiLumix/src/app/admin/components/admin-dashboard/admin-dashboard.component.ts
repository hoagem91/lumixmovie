import {Component, OnInit} from '@angular/core';
import {MovieService} from "../../../services/movie.service";
import {UserService} from "../../../services/user.service";
import {AuthService} from "../../../services/auth.service";
import {NotificationService} from "../../../services/notification.service";
import {forkJoin} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  totalMovies: number = 0;
  totalUsers: number = 0;
  totalComment: number = 0;
  adminUsername: string = 'Admin';
  moviesGrowth: number = 0;
  usersGrowth: number = 0;
  commentsGrowth: number = 0;

  isLoading:boolean = true;
  constructor(private movieService: MovieService, private userService: UserService, private authService: AuthService,private notification:NotificationService,private router:Router) {
  }

  ngOnInit(): void {
    this.adminUsername = this.authService.getUsername() || 'Admin'
    this.loadDataInit();
  }

  loadDataInit() {
    forkJoin({
      movies:this.movieService.getAllMovies(),
      users:this.userService.getAllUsers(),
      comments:this.movieService.getAllComment()
    }).subscribe({
      next: ({movies,users,comments}) => {
        this.totalMovies = movies.length;
        this.totalUsers = users.length;
        this.totalComment = comments.length;

        this.moviesGrowth = (Math.random() - 0.4) * 20;
        this.usersGrowth = (Math.random() - 0.5) * 10;
        this.commentsGrowth = (Math.random() - 0.2) * 30;

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.show("Không thể tải dữ liệu cho trang quản trị!",'error');
      }
    })
  }

  isPositiveGrowth(value: number): boolean {
    return value >= 0;
  }

  navigateToMovies(){
    this.router.navigate(['/admin/movies/create'])
  }
  navigateToUsers(){
    this.router.navigate(['/admin/users'])
  }
  navigateToComments(){
    this.router.navigate(['/admin/comments'])
  }
}
