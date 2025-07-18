import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Code as CodeIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Computer as ComputerIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  Terminal as TerminalIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    completionRate: 0,
    popularLanguages: [],
    recentCourses: [],
    studentProgress: []
  });

  // Mock data for programming courses
  const mockData = {
    totalCourses: 156,
    totalStudents: 2847,
    totalInstructors: 23,
    completionRate: 78.5,
    popularLanguages: [
      { name: 'JavaScript', value: 35, color: '#f7df1e' },
      { name: 'Python', value: 28, color: '#3776ab' },
      { name: 'React', value: 22, color: '#61dafb' },
      { name: 'Java', value: 15, color: '#ed8b00' }
    ],
    recentCourses: [
      { id: 1, title: 'Advanced React Hooks', instructor: 'John Doe', students: 234, rating: 4.8, language: 'React' },
      { id: 2, title: 'Python for Data Science', instructor: 'Jane Smith', students: 189, rating: 4.9, language: 'Python' },
      { id: 3, title: 'Node.js Backend Development', instructor: 'Mike Johnson', students: 156, rating: 4.7, language: 'JavaScript' },
      { id: 4, title: 'Java Spring Boot', instructor: 'Sarah Wilson', students: 98, rating: 4.6, language: 'Java' }
    ],
    monthlyStats: [
      { month: 'Jan', courses: 12, students: 245 },
      { month: 'Feb', courses: 18, students: 312 },
      { month: 'Mar', courses: 15, students: 289 },
      { month: 'Apr', courses: 22, students: 456 },
      { month: 'May', courses: 19, students: 398 },
      { month: 'Jun', courses: 25, students: 523 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}20`
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color, mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 60, height: 60 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const LanguageChip = ({ language, color }) => (
    <Chip
      label={language}
      sx={{
        bgcolor: `${color}20`,
        color: color,
        fontWeight: 600,
        border: `1px solid ${color}40`
      }}
      size="small"
    />
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Programming Course Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi các khóa học lập trình
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng Khóa Học"
            value={dashboardData.totalCourses}
            icon={<CodeIcon sx={{ fontSize: 30 }} />}
            color="#3b82f6"
            subtitle="Khóa học lập trình"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Học Viên"
            value={dashboardData.totalStudents.toLocaleString()}
            icon={<PeopleIcon sx={{ fontSize: 30 }} />}
            color="#10b981"
            subtitle="Đang học tập"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Giảng Viên"
            value={dashboardData.totalInstructors}
            icon={<SchoolIcon sx={{ fontSize: 30 }} />}
            color="#f59e0b"
            subtitle="Chuyên gia IT"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tỷ Lệ Hoàn Thành"
            value={`${dashboardData.completionRate}%`}
            icon={<TrendingUpIcon sx={{ fontSize: 30 }} />}
            color="#ef4444"
            subtitle="Trung bình"
          />
        </Grid>
      </Grid>

      {/* Charts and Recent Activity */}
      <Grid container spacing={3}>
        {/* Popular Programming Languages */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <LanguageIcon sx={{ mr: 1, color: '#3b82f6' }} />
                Ngôn Ngữ Lập Trình Phổ Biến
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.popularLanguages}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {dashboardData.popularLanguages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Statistics */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1, color: '#10b981' }} />
                Thống Kê Theo Tháng
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="courses" fill="#3b82f6" name="Khóa học" />
                  <Bar dataKey="students" fill="#10b981" name="Học viên" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Courses */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <ComputerIcon sx={{ mr: 1, color: '#f59e0b' }} />
                Khóa Học Mới Nhất
              </Typography>
              <List>
                {dashboardData.recentCourses.map((course, index) => (
                  <React.Fragment key={course.id}>
                    <ListItem
                      sx={{
                        '&:hover': { bgcolor: '#f8fafc' },
                        borderRadius: 2,
                        mb: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#3b82f6' }}>
                          <TerminalIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {course.title}
                            </Typography>
                            <LanguageChip 
                              language={course.language} 
                              color={dashboardData.popularLanguages.find(l => l.name === course.language)?.color || '#6b7280'} 
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Giảng viên: {course.instructor}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                              <Box display="flex" alignItems="center">
                                <PeopleIcon sx={{ fontSize: 16, mr: 0.5, color: '#6b7280' }} />
                                <Typography variant="caption">{course.students} học viên</Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <StarIcon sx={{ fontSize: 16, mr: 0.5, color: '#fbbf24' }} />
                                <Typography variant="caption">{course.rating}/5</Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                      <IconButton color="primary">
                        <PlayIcon />
                      </IconButton>
                    </ListItem>
                    {index < dashboardData.recentCourses.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
