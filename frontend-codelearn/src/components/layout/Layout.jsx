
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import AutoScrollToTop from './AutoScrollToTop';
import ParticlesBackground from '../common/ParticlesBackground';
import CodeRain from '../common/CodeRain';

const Layout = ({ children }) => {
  return (
    <>
      <AutoScrollToTop />
      <ParticlesBackground />
      <CodeRain />
      <Header />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default Layout;