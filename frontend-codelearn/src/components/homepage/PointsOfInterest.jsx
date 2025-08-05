
import { motion } from 'framer-motion';

const PointsOfInterest = () => {
  // Points of interest data
  const pointsData = [
    {
      id: 1,
      icon: "fas fa-code",
      title: "Học từ Cơ bản",
      description: "Bắt đầu từ những kiến thức nền tảng, phù hợp cho người mới bắt đầu học lập trình. Từ HTML, CSS đến JavaScript và các ngôn ngữ khác."
    },
    {
      id: 2,
      icon: "fas fa-laptop-code",
      title: "Thực hành Thực tế",
      description: "Học qua các dự án thực tế, xây dựng portfolio ấn tượng. Từ website đơn giản đến ứng dụng web phức tạp."
    },
    {
      id: 3,
      icon: "fas fa-users",
      title: "Cộng đồng Hỗ trợ",
      description: "Tham gia cộng đồng học viên năng động, chia sẻ kinh nghiệm và hỗ trợ lẫn nhau trong quá trình học tập."
    },
    {
      id: 4,
      icon: "fas fa-certificate",
      title: "Chứng chỉ Miễn phí",
      description: "Nhận chứng chỉ hoàn thành khóa học miễn phí, khẳng định năng lực và kiến thức đã học được."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="points-of-interest">
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Tại sao chọn học lập trình với chúng tôi?
        </motion.h2>
        <motion.div
          className="poi-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pointsData.map((point) => (
            <motion.div
              className="poi-card"
              key={point.id}
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                className="poi-icon"
                whileHover={{
                  rotate: 360,
                  transition: { duration: 0.6 }
                }}
              >
                <i className={point.icon}></i>
              </motion.div>
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PointsOfInterest;