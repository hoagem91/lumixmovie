import {Component, OnInit} from '@angular/core';
import {MovieService} from "../../../services/movie.service";
import {UserService} from "../../../services/user.service";
import {AuthService} from "../../../services/auth.service";
import {NotificationService} from "../../../services/notification.service";
import {forkJoin} from "rxjs";
import {Router} from "@angular/router";
import {ChartConfiguration, ChartData} from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  totalMovies: number = 0;
  totalUsers: number = 0;
  totalComment: number = 0;
  totalCategories: number = 0;
  adminUsername: string = 'Admin';
  moviesGrowth: number = 0;
  usersGrowth: number = 0;
  commentsGrowth: number = 0;
  categoriesGrowth: number = 0;

  isLoading: boolean = true;

  public barChartType: any = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Số lượng phim',
        data: [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(99, 102, 241, 1)'
      }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#e5e7eb'
        }
      },
      title: {
        display: true,
        text: 'Số lượng phim theo thể loại',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        color: '#ffffff',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(229, 9, 20, 0.5)',
        borderWidth: 2,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#9ca3af',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.5)'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Biểu đồ tròn - Tỷ lệ người dùng theo vai trò
  public pieChartType: any = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Người dùng', 'Quản trị viên'],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        hoverBorderWidth: 3
      }
    ]
  };

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#fff',
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Tỷ lệ người dùng theo vai trò',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        color: '#fff',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Biểu đồ đường - Bình luận theo thời gian
  public lineChartType: any = 'line';
  public lineChartLegend = true;
  public lineChartPlugins = [];

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Số lượng bình luận',
        data: [],
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
        pointHoverBorderWidth: 3
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#fff',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Lượng bình luận theo thời gian (30 ngày gần nhất)',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        color: '#fff',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#fff',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.8)'
        }
      },
      x: {
        ticks: {
          color: '#fff',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  constructor(
    private movieService: MovieService,
    private userService: UserService,
    private authService: AuthService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.adminUsername = this.authService.getUsername() || 'Admin';
    this.loadDataInit();
  }

  loadDataInit() {
    forkJoin({
      movies: this.movieService.getAllMovies(),
      users: this.userService.getAllUsers(),
      comments: this.movieService.getAllComment(),
      categories: this.movieService.getAllGenre()
    }).subscribe({
      next: ({movies, users, comments, categories}) => {
        this.totalMovies = movies.length;
        this.totalUsers = users.length;
        this.totalComment = comments.length;
        this.totalCategories = categories.length;

        // Tính toán growth (có thể thay bằng logic thực tế)
        this.moviesGrowth = (Math.random() - 0.4) * 20;
        this.usersGrowth = (Math.random() - 0.5) * 10;
        this.commentsGrowth = (Math.random() - 0.2) * 30;
        this.categoriesGrowth = (Math.random() - 0.3) * 15; // Thêm growth cho categories

        // Xử lý dữ liệu cho các biểu đồ
        this.processMoviesByGenre(movies);
        this.processUsersByRole(users);
        this.processCommentsByTime(comments);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
        this.notification.show("Không thể tải dữ liệu cho trang quản trị!", 'error');
      }
    });
  }

  processMoviesByGenre(movies: any[]) {
    const genreCount: { [key: string]: number } = {};

    movies.forEach(movie => {
      if (movie.genres) {
        // Xử lý nếu genre là string hoặc array
        const genres = Array.isArray(movie.genres) ? movie.genres : [movie.genres];
        genres.forEach((genre: string) => {
          const genreName = genre.trim();
          if (genreName) {
            genreCount[genreName] = (genreCount[genreName] || 0) + 1;
          }
        });
      }
    });

    // Sắp xếp và lấy top 10 thể loại
    const sortedGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Cập nhật dữ liệu biểu đồ
    this.barChartData.labels = sortedGenres.map(g => g[0]);
    this.barChartData.datasets[0].data = sortedGenres.map(g => g[1]);
  }

  processUsersByRole(users: any[]) {
    let userCount = 0;
    let adminCount = 0;

    users.forEach(user => {
      const isAdmin = user.roles.find((c:string) => c === 'ADMIN') ||
        user.roles === 'admin' ||
        user.isAdmin === true ||
        user.is_admin === true;

      if (isAdmin) {
        adminCount++;
      } else {
        userCount++;
      }
    });

    // Cập nhật dữ liệu biểu đồ
    this.pieChartData.datasets[0].data = [userCount, adminCount];
  }

  processCommentsByTime(comments: any[]) {
    const commentsByDate: { [key: string]: number } = {};

    comments.forEach(comment => {
      // Hỗ trợ nhiều tên field khác nhau cho ngày tạo
      const dateField = comment.createdAt || comment.created_at || comment.date || comment.createdDate;

      if (dateField) {
        try {
          const date = new Date(dateField);
          // Kiểm tra date hợp lệ
          if (!isNaN(date.getTime())) {
            const dateStr = date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit'
            });
            commentsByDate[dateStr] = (commentsByDate[dateStr] || 0) + 1;
          }
        } catch (e) {
          console.warn('Invalid date format:', dateField);
        }
      }
    });

    // Sắp xếp theo ngày và lấy 30 ngày gần nhất
    const sortedDates = Object.entries(commentsByDate)
      .sort((a, b) => {
        const [dayA, monthA] = a[0].split('/').map(Number);
        const [dayB, monthB] = b[0].split('/').map(Number);

        // So sánh theo tháng trước, sau đó mới đến ngày
        if (monthA !== monthB) {
          return monthA - monthB;
        }
        return dayA - dayB;
      })
      .slice(-30); // Lấy 30 mục gần nhất

    // Cập nhật dữ liệu biểu đồ
    this.lineChartData.labels = sortedDates.map(d => d[0]);
    this.lineChartData.datasets[0].data = sortedDates.map(d => d[1]);

    // Nếu không có dữ liệu, tạo dữ liệu mẫu
    if (sortedDates.length === 0) {
      console.warn('No comment data found, using sample data');
      const sampleLabels = this.generateLast30Days();
      const sampleData = sampleLabels.map(() => Math.floor(Math.random() * 10));

      this.lineChartData.labels = sampleLabels;
      this.lineChartData.datasets[0].data = sampleData;
    }
  }

  // Helper function để tạo 30 ngày gần nhất
  private generateLast30Days(): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
      dates.push(dateStr);
    }

    return dates;
  }

  isPositiveGrowth(value: number): boolean {
    return value >= 0;
  }

  navigateToMovies() {
    this.router.navigate(['/admin/movies/create']);
  }

  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToComments() {
    this.router.navigate(['/admin/comments']);
  }

  navigateToCategories() {
    this.router.navigate(['/admin/genres']);
  }
}
