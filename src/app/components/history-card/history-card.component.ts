import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {WatchHistory} from "../../models/movie.model";
import {Router} from "@angular/router";
import {MovieService} from "../../services/movie.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-history-card',
  templateUrl: './history-card.component.html',
  styleUrls: ['./history-card.component.scss']
})
export class HistoryCardComponent implements OnInit {
  @Input() historyItem!: WatchHistory;
  @Output() deleted = new EventEmitter<string>();
  isDeleting = false;

  constructor(private router: Router, private movieService: MovieService, private notification: NotificationService) {
  }

  ngOnInit(): void {
  }
  onDeleteClick(event:MouseEvent){
    event.stopPropagation();
    if(this.isDeleting) return;
    this.isDeleting = true;
    this.movieService.deleteWatchHistory(this.historyItem.movie.id).subscribe({
      next:()=>{
        this.notification.show("Đã xoá khỏi lịch sử xem",'success');
        this.deleted.emit(this.historyItem.movie.id);
      },
      error:()=>{
        this.notification.show("Xoá khỏi lịch sử thất bại",'error');
        this.isDeleting = false;
      }
    })
  }
  getProgressPercentage(): number {
    if (!this.historyItem.movie.duration || this.historyItem.progressInSeconds <= 0) return 0;
    const totalSeconds = this.convertDurationToSeconds(this.historyItem.movie.duration);
    if (totalSeconds === 0) return 0;
    return (this.historyItem.progressInSeconds / totalSeconds) * 100;
  }

  navigateToDetail() {
    this.router.navigate(['movies', this.historyItem.movie.id]);
  }

  private convertDurationToSeconds(duration: string): number {
    if (!duration) return 0;
    let totalSeconds = 0;
    const hourMatch = duration.match(/(\d+)\s*h/);
    const minMatch = duration.match(/(\d+)\s*m/);
    if (hourMatch) {
      totalSeconds += parseInt(hourMatch[1], 10) * 3600;
    }
    if (minMatch) {
      totalSeconds += parseInt(minMatch[1], 10) * 60;
    }
    return totalSeconds;
  }
  formatTime(totalSeconds:number):string{
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
