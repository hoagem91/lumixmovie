import {Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {MovieService} from "../../services/movie.service";
import {Genre, Movie} from "../../models/movie.model";
import {CommentModel} from "../../models/comment.model";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard-comment',
  templateUrl: './dashboard-comment.component.html',
  styleUrls: ['./dashboard-comment.component.scss']
})
export class DashboardCommentComponent implements OnInit, OnDestroy ,AfterViewInit{
  @Input() movies: Movie[] = [];
  comments: CommentModel[] = [];
  newComments: CommentModel[] = [];
  categories: Genre[] = [];
  favoritesMovies: Movie[] = [];

  // Popup variables
  popupTitle: string = '';
  popupItems: any[] = [];
  popupType: 'movies'|'categories'|'comments' = 'movies';
  isMostActivePopupVisible: boolean = false;

  // Auto slide variables
  private autoSlideInterval: any;
  private autoSlideDelay: number = 5000;
  currentSlideIndex: number = 0;
  cardsPerView: number = 3; // Số card hiển thị trên 1 màn
  private resizeObserver: ResizeObserver | null = null;

  // Touch swipe variables
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private minSwipeDistance: number = 50;

  @ViewChild('carouselTrack') carouselTrack!:ElementRef;
  @ViewChild('carouselContainer') carouselContainer!:ElementRef;
  constructor(private movieService:MovieService,private authService:AuthService,private userService:UserService,private router:Router) {
  }
  ngOnInit(): void {
    this.loadCommentsData();
    this.loadCategory();
    this.loadFirstComments();
    this.loadFavoritesMovie();
  }
  ngOnDestroy(): void {
    this.stopAutoSlide();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
  ngAfterViewInit(): void {
    // Tính toán số card hiển thị dựa trên kích thước màn hình
    this.calculateCardsPerView();

    // Theo dõi thay đổi kích thước màn hình
    this.setupResizeObserver();

    // Bắt đầu auto slide sau khi load data
    setTimeout(() => {
      if (this.comments.length > 0) {
        this.startAutoSlide();
      }
    }, 500);
  }

  // Tính toán số card hiển thị theo kích thước màn hình
  calculateCardsPerView(): void {
    const containerWidth = window.innerWidth - 80; // Trừ padding
    const cardWidth = 320; // Width của comment-card
    const gap = 20;

    if (window.innerWidth <= 768) {
      this.cardsPerView = 1;
    } else if (window.innerWidth <= 1024) {
      this.cardsPerView = 2;
    } else if (window.innerWidth <= 1440) {
      this.cardsPerView = 3;
    } else {
      this.cardsPerView = Math.floor(containerWidth / (cardWidth + gap));
    }
  }

  // Theo dõi thay đổi kích thước
  setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.calculateCardsPerView();
      // Reset về slide đầu tiên khi resize
      this.currentSlideIndex = 0;
      this.scrollToSlide(0);
    });

    const container = this.carouselContainer.nativeElement as HTMLDivElement;
    if (container) {
      this.resizeObserver.observe(container);
    }
  }

  // Bắt đầu auto slide
  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideDelay);
  }

  // Dừng auto slide
  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // Chuyển sang slide tiếp theo
  nextSlide(): void {
    // Không cho cuộn quá số lượng thẻ có thể hiển thị
    const maxIndex = this.comments.length - this.cardsPerView;
    if (this.currentSlideIndex < maxIndex) {
      this.currentSlideIndex++;
      this.scrollToSlide(this.currentSlideIndex);
    } else {
      // Nếu muốn lặp lại từ đầu khi đến cuối
      this.currentSlideIndex = 0;
      this.scrollToSlide(this.currentSlideIndex);
    }
  }

  // Chuyển sang slide trước đó
  prevSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.scrollToSlide(this.currentSlideIndex);
    }
  }

  // Chuyển đến slide cụ thể
  goToSlide(index: number): void {
    // Chuyển đến trang chứa thẻ đó
    this.currentSlideIndex = index * this.cardsPerView;
    this.scrollToSlide(this.currentSlideIndex);

    // Reset auto slide timer
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  // Scroll đến thẻ có chỉ số (index)
  private scrollToSlide(index: number): void {
    const track = this.carouselTrack?.nativeElement as HTMLElement;
    if (!track) return;

    const cardWidth = 320;
    const gap = 20;
    const scrollPosition = index * (cardWidth + gap);

    track.style.transform = `translateX(-${scrollPosition}px)`;
  }

  // Tính tổng số trang (dùng cho dots)
  getTotalSlides(): number {
    return Math.ceil(this.comments.length / this.cardsPerView);
  }

  // Tạo array cho dots indicators
  getSlidesArray(): number[] {
    return Array.from({ length: this.getTotalSlides() }, (_, i) => i);
  }

  // Dừng auto slide khi hover
  onCarouselMouseEnter(): void {
    this.stopAutoSlide();
  }

  // Tiếp tục auto slide khi mouse leave
  onCarouselMouseLeave(): void {
    this.startAutoSlide();
  }

  // Touch swipe handlers
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.stopAutoSlide();
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
    this.startAutoSlide();
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next slide
        this.nextSlide();
      } else {
        // Swipe right - previous slide
        this.prevSlide();
      }
    }
  }

  // Popup methods
  openMostActivePopup(title: string, items: any[], type: 'movies'|'categories'|'comments'): void {
    this.popupTitle = title;
    this.popupItems = items;
    this.popupType = type;
    this.isMostActivePopupVisible = true;
  }

  closeMostActivePopup(): void {
    this.isMostActivePopupVisible = false;
  }

  // Load data methods
  loadCommentsData(): void {
    this.movieService.getAllComment().subscribe((comments) => {
      this.comments = comments;
      // Restart auto slide sau khi load xong data
      if (comments.length > 0) {
        this.stopAutoSlide();
        this.startAutoSlide();
      }
    });
  }

  loadCategory(): void {
    this.movieService.getAllGenre().subscribe((genres) => this.categories = genres);
  }

  loadFirstComments(): void {
    this.movieService.getAllComment().subscribe({
      next: (comments) => {
        this.newComments = comments.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (err) => console.log(err)
    });
  }

  loadFavoritesMovie(): void {
    if (this.authService.isLoggedIn()) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.userService.getFavoriteMovies(userId).subscribe(
          (movies) => this.favoritesMovies = movies
        );
      }
    }
  }

  onMoveClick(id:string){
    this.router.navigate(['/movies',id])
  }
}
