import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-column">
            <h3>Về CodeLearn</h3>
            <p>CodeLearn là nền tảng học lập trình miễn phí, cung cấp các khóa học chất lượng cao từ cơ bản đến nâng cao. Chúng tôi cam kết mang đến cơ hội học tập tốt nhất cho mọi người.</p>
          </div>
          
          <div className="footer-column">
            <h3>Liên kết nhanh</h3>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/courses">Khóa học</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Tài nguyên</h3>
            <ul>
              <li><a href="#">Tài liệu học tập</a></li>
              <li><a href="#">Video hướng dẫn</a></li>
              <li><a href="#">Code examples</a></li>
              <li><a href="#">Cheat sheets</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Liên hệ</h3>
            <p><i className="fas fa-map-marker-alt"></i> 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
            <p><i className="fas fa-phone"></i> (84) 123-456-789</p>
            <p><i className="fas fa-envelope"></i> contact@codelearn.vn</p>
            <div className="social-media">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 DUPSS - Dự án Phòng ngừa Sử dụng Ma túy trong Cộng đồng. Tất cả quyền được bảo lưu.</p>
          <div className="footer-links">
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;