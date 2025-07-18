import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HeroBanner = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'console.log("Welcome to CodeLearn!");';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-banner">
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="code-snippet">
            <span className="code-text">{displayText}</span>
            <span className="cursor">|</span>
          </div>
          <h1>Học Lập Trình Miễn Phí - Khởi Đầu Sự Nghiệp IT</h1>
          <p>Khám phá thế giới lập trình với các khóa học chất lượng cao, hoàn toàn miễn phí. Từ cơ bản đến nâng cao, chúng tôi đồng hành cùng bạn trên con đường trở thành lập trình viên chuyên nghiệp.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/courses" className="cta-button">
              <i className="fas fa-code"></i>
              Khám phá khóa học
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;