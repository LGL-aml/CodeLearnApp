import HeroBanner from './HeroBanner';
import PointsOfInterest from './PointsOfInterest';
import FeaturedCourses from './FeaturedCourses';
import { useEffect } from 'react';

const HomePage = () => {
  useEffect(() => {
    document.title = "CodeLearn - Học Lập Trình Miễn Phí | Khóa học từ cơ bản đến nâng cao";
  }, []);

  return (
    <>
      <HeroBanner />
      <FeaturedCourses />
      <PointsOfInterest />
    </>
  );
};

export default HomePage;