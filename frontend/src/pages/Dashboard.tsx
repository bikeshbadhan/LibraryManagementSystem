import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
  Modal,
  TextInput,
  InlineNotification,
  Stack,
} from '@carbon/react';
import { Logout, Home, Book, User, UserMultiple, Password, Send, Receipt, Currency, Alarm, Asleep, Light, Settings } from '@carbon/icons-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import HomePage from './HomePage';
import BooksPage from './BooksPage';
import MembersPage from './MembersPage';
import IssueBooksPage from './IssueBooksPage';
import ReceiveBooksPage from './ReceiveBooksPage';
import FinesPage from './FinesPage';
import UsersPage from './UsersPage';
import OverdueBooksPage from './OverdueBooksPage';
import SettingsPage from './SettingsPage';

function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    // Cycle through: light -> dark -> system -> light
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <>
      <Header aria-label="Library Management System">
        <HeaderMenuButton
          aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
          onClick={() => setIsSideNavExpanded(!isSideNavExpanded)}
          isActive={isSideNavExpanded}
        />
        <HeaderName href="/" prefix="">
          Library Management System
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction 
            aria-label={
              themeMode === 'light' 
                ? 'Switch to Dark Mode' 
                : themeMode === 'dark' 
                ? 'Switch to System Mode' 
                : 'Switch to Light Mode'
            }
            onClick={toggleTheme} 
            tooltipAlignment="end"
          >
            {theme === 'dark' ? <Light size={20} /> : <Asleep size={20} />}
          </HeaderGlobalAction>
          <HeaderGlobalAction 
            aria-label="Change Password" 
            onClick={() => setIsPasswordModalOpen(true)} 
            tooltipAlignment="end"
          >
            <Password size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Logout" onClick={handleLogout} tooltipAlignment="end">
            <Logout size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <Modal
        open={isPasswordModalOpen}
        modalHeading="Change Password"
        primaryButtonText="Change Password"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          setIsPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError('');
          setPasswordSuccess('');
        }}
        onRequestSubmit={handlePasswordChange}
      >
        <Stack gap={5}>
          {passwordError && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={passwordError}
              onCloseButtonClick={() => setPasswordError('')}
              lowContrast
            />
          )}
          {passwordSuccess && (
            <InlineNotification
              kind="success"
              title="Success"
              subtitle={passwordSuccess}
              lowContrast
            />
          )}
          <TextInput
            id="current-password"
            type="password"
            labelText="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <TextInput
            id="new-password"
            type="password"
            labelText="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextInput
            id="confirm-password"
            type="password"
            labelText="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Stack>
      </Modal>

      <SideNav 
        aria-label="Side navigation" 
        isFixedNav
        expanded={isSideNavExpanded}
        onOverlayClick={() => setIsSideNavExpanded(false)}
      >
        <SideNavItems>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <>
              <SideNavLink
                renderIcon={Home}
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                isActive={isActive('/')}
              >
                Home
              </SideNavLink>
            </>
          )}
          
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <>
              <SideNavLink
                renderIcon={Book}
                href="/books"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/books');
                }}
                isActive={isActive('/books')}
              >
                Books
              </SideNavLink>
              <SideNavLink
                renderIcon={User}
                href="/members"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/members');
                }}
                isActive={isActive('/members')}
              >
                Members
              </SideNavLink>
              <SideNavLink
                renderIcon={Send}
                href="/issue-books"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/issue-books');
                }}
                isActive={isActive('/issue-books')}
              >
                Issue Books
              </SideNavLink>
              <SideNavLink
                renderIcon={Receipt}
                href="/receive-books"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/receive-books');
                }}
                isActive={isActive('/receive-books')}
              >
                Receive Books
              </SideNavLink>
              <SideNavLink
                renderIcon={Alarm}
                href="/overdue-books"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/overdue-books');
                }}
                isActive={isActive('/overdue-books')}
              >
                Overdue Books
              </SideNavLink>
              <SideNavLink
                renderIcon={Currency}
                href="/fines"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/fines');
                }}
                isActive={isActive('/fines')}
              >
                Fines
              </SideNavLink>
            </>
          )}

          {(user?.role === 'student' || user?.role === 'faculty') && (
            <>
              <SideNavLink
                renderIcon={Book}
                href="/catalog"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/catalog');
                }}
                isActive={isActive('/catalog')}
              >
                Book Catalog
              </SideNavLink>
              <SideNavLink
                renderIcon={User}
                href="/my-account"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/my-account');
                }}
                isActive={isActive('/my-account')}
              >
                My Account
              </SideNavLink>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <SideNavLink
                renderIcon={UserMultiple}
                href="/users"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/users');
                }}
                isActive={isActive('/users')}
              >
                User Management
              </SideNavLink>
              <SideNavLink
                renderIcon={Settings}
                href="/settings"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/settings');
                }}
                isActive={isActive('/settings')}
              >
                Settings
              </SideNavLink>
            </>
          )}
        </SideNavItems>
      </SideNav>

      <Content>
        <Routes>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/issue-books" element={<IssueBooksPage />} />
              <Route path="/receive-books" element={<ReceiveBooksPage />} />
              <Route path="/overdue-books" element={<OverdueBooksPage />} />
              <Route path="/fines" element={<FinesPage />} />
            </>
          )}
          {(user?.role === 'student' || user?.role === 'faculty') && (
            <>
              <Route path="/" element={<Navigate to="/catalog" replace />} />
              <Route path="/catalog" element={<BooksPage readOnly />} />
              <Route path="/my-account" element={<MembersPage memberId={user?.memberId} readOnly />} />
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </>
          )}
        </Routes>
      </Content>
    </>
  );
}

export default Dashboard;
