export interface Category {
  name: string;
  slug: string; // Giả sử bạn có slug từ API
  link?: string; // link sẽ được tạo ra sau
  bgColor?: string; // bgColor sẽ được thêm vào sau
}