import { Component, OnInit } from '@angular/core';
import {Movie, WatchHistory} from "../../models/movie.model";
import {MovieService} from "../../services/movie.service";
import {NotificationService} from "../../services/notification.service";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-watch-history',
  templateUrl: './watch-history.component.html',
  styleUrls: ['./watch-history.component.scss']
})
export class WatchHistoryComponent implements OnInit {
  historyItems :WatchHistory[] = [];
  isLoading = true;
  error:string|null=null;
  constructor(private movieService:MovieService,private authService:AuthService,private notification:NotificationService) { }

  ngOnInit(): void {
    this.loadHistory();
  }
  loadHistory(){
    this.isLoading = true;
    this.error = null;
    this.movieService.continueWatching().subscribe({
      next:(historyItems)=>{
        this.historyItems = historyItems;
        this.isLoading = false;
      },
      error:(err)=>{
        this.isLoading = false;
        this.error = "Đã xảy ra lỗi khi tải lịch sử xem của bạn.";
        this.notification.show(this.error,'error');
      }
    })
  }
  handleItemDeleted(deletedMovieId:string){
    this.historyItems = this.historyItems.filter(item=>item.movie.id != deletedMovieId);
  }
}
