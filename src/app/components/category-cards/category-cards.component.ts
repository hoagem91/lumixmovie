import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {MovieService} from "../../services/movie.service";
import {Category} from "../../models/category.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-category-cards',
  templateUrl: './category-cards.component.html',
  styleUrls: ['./category-cards.component.scss']
})
export class CategoryCardsComponent implements OnInit, OnChanges ,OnDestroy{
  @Input() categories: any[] = [];
  processedCategories: Category[] = [];

  // Auto slide variables
  private autoSlideInterval: any;
  private autoSlideDelay: number = 5000;
  currentSlideIndex: number = 0;
  cardsPerView: number = 7; // Số card hiển thị trên 1 màn
  private resizeObserver: ResizeObserver | null = null;

  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private minSwipeDistance: number = 50;

  // Map tên thể loại -> màu sắc
  private categoryColors: Record<string, string> = {
    "Chính Kịch": "#6BCB77",
    "Hài": "#FFD93D",
    "Hoạt Hình": "#4D96FF",
    "Anime": "#FF6B6B",
    "Bí Ẩn": "#9D4EDD",
    "Chiến Tranh": "#FF924C",
    "Chiếu Rạp": "#2EC4B6",
    "Chuyển Thể": "#FF6F91",
    "Cổ Điển": "#F15BB5",
    "Cổ Trang": "#845EC2",
    "DC": "#2A2A72",
    "Đời Thường": "#FF9671",
    "Gay Cấn": "#FFAA5A",
    "Gia Đình": "#00C9A7",
    "Hành Động": "#FF4C29",
    "Hình Sự": "#3C486B",
    "Hoàng Cung": "#5D5FEF",
    "Học Đường": "#6A4C93",
    "Khoa Học": "#38A3A5",
    "Kinh Dị": "#E63946",
    "Kinh Điển": "#606C38",
    "Kỳ Ảo": "#F6BD60",
    "Lãng Mạn": "#FF85A1",
    "LGBT+": "#9A348E",
    "Marvel": "#ED1D24",
    "Nghề Nghiệp": "#00A896",
    "Nhạc Kịch": "#F3722C",
    "Phiêu Lưu": "#3A86FF",
    "Siêu Anh Hùng": "#8338EC",
    "Tâm Lý": "#6D6875",
    "Thần Thoại": "#FFB703",
    "Thể Thao": "#219EBC",
    "Thiếu Nhi": "#90BE6D",
    "Tình Cảm": "#FF6B6B",
    "Viễn Tưởng": "#118AB2",
    "Xuyên Không": "#EF476F",
    "Default": "#A0A0A0"
  };

  constructor(private movieService: MovieService, private router: Router) {
  }

  ngOnInit(): void {
    this.calculateCardsPerView();
    this.setupResizeObserver();

    setTimeout(() => {
      if (this.categories.length > 0) {
        this.startAutoSlide();
      }
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Chỉ thực thi khi @Input() categories thay đổi và có giá trị
    if (changes['categories'] && changes['categories'].currentValue) {
      const incomingCategories: Category[] = changes['categories'].currentValue;

      this.processedCategories = incomingCategories.map(cat => {
        const cleanName = cat.name.trim();
        return {
          ...cat,
          name: cleanName,
          link: `/category/${cat.slug}`,
          bgColor: this.categoryColors[cleanName] || this.categoryColors["Default"]
        };
      });
    }
  }
  ngOnDestroy() {
    this.stopAutoSlide();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // Tính toán số card hiển thị theo kích thước màn hình
  calculateCardsPerView(): void {
    const containerWidth = window.innerWidth - 80; // Trừ padding
    const cardWidth = 320; // Width của comment-card
    const gap = 20;

    if (window.innerWidth <= 768) {
      this.cardsPerView = 3;
    } else if (window.innerWidth <= 1024) {
      this.cardsPerView = 5;
    } else if (window.innerWidth <= 1440) {
      this.cardsPerView = 7;
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

    const container = document.querySelector('.carousel-container');
    if (container) {
      this.resizeObserver.observe(container);
    }
  }
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
    const maxIndex = this.categories.length - this.cardsPerView;
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
    const track = document.querySelector('.carousel-track') as HTMLElement;
    if (!track) return;

    const cardWidth = 200;
    const gap = 20;
    const scrollPosition = index * (cardWidth + gap);

    track.style.transform = `translateX(-${scrollPosition}px)`;
  }

  // Tính tổng số trang (dùng cho dots)
  getTotalSlides(): number {
    return Math.ceil(this.categories.length / this.cardsPerView);
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
  onCategoryClick(title: string) {
    this.router.navigate(['/category', title]);
  }
}
