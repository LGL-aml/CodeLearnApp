import { Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Box, Container, InputAdornment } from '@mui/material';
import AuthButtons from './AuthButtons';

const Header = () => {
  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <RouterLink to="/">
            <div className="logo-icon">
              <i className="fas fa-code"></i>
            </div>
            <div className="logo-text">
              <span className="logo-title">CodeLearn</span>
              <span className="logo-subtitle">Học Lập Trình Miễn Phí</span>
            </div>
          </RouterLink>
        </div>
        
        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;