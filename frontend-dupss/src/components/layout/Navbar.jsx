import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [activePage, setActivePage] = useState('');

  // Function to update active page state
  const updateActivePage = (path) => {
    if (path === '/') return 'home';
    if (path.startsWith('/courses')) return 'courses';
    // For login, register and profile pages, don't highlight any navigation item
    if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/profile') || path.startsWith('/forgot-password')) return '';
    return '';
  };

  // Monitor route changes and update active page
  useEffect(() => {
    setActivePage(updateActivePage(location.pathname));
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <ul className="nav-links">
          <li>
            <RouterLink
              to="/"
              className={activePage === 'home' ? 'active' : ''}
            >
              <i className="fas fa-home"></i>
              <span>Trang chủ</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/courses"
              className={activePage === 'courses' ? 'active' : ''}
            >
              <i className="fas fa-graduation-cap"></i>
              <span>Khóa học</span>
            </RouterLink>
          </li>

        </ul>
      </div>
    </nav>
  );
};

export default Navbar;