/**
 * Utility for managing page titles
 */

// Base title for the application
const baseTitle = 'Quản Lý Khóa Học';

/**
 * Set the page title with the format: "Page Name - CodeLearn Management"
 * @param {string} pageTitle - The page-specific title
 */
export const setPageTitle = (pageTitle) => {
  if (pageTitle) {
    document.title = `${pageTitle} - ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
};

/**
 * Get page title based on pathname
 * @param {string} pathname - Current path
 * @returns {string} Page title
 */
export const getPageTitleFromPath = (pathname) => {
  // Extract the last part of the path
  const path = pathname.split('/').filter(Boolean);
  const lastSegment = path[path.length - 1];
  
  // Map paths to titles
  const titleMap = {
    // Admin routes
    'users': 'Quản Lý Người Dùng',
    'topics': 'Quản Lý Chủ Đề',
    
    // Staff routes
    'courses': 'Quản Lý Khóa Học',
    'create': 'Tạo Khóa Học Mới',
    
    // Common routes
    'profile': 'Hồ Sơ Cá Nhân',
    'login': 'Đăng Nhập'
  };
  
  // Special case for edit course
  if (path.includes('edit')) {
    return 'Chỉnh Sửa Khóa Học';
  }
  
  return titleMap[lastSegment] || baseTitle;
}; 