import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FluidForm,
  TextInput,
  Button,
  InlineNotification,
  Stack,
  Tile,
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
} from '@carbon/react';
import { Login as LoginIcon } from '@carbon/icons-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const LOGIN_BACKGROUND_LIGHT = '/login-background.jpg';
const LOGIN_BACKGROUND_DARK = '/login-background-dark.jpg';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileWidgetId = useRef<string | null>(null);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Only initialize Turnstile if site key is configured
    if (!TURNSTILE_SITE_KEY) {
      setTurnstileToken('no-verification'); // Skip verification
      return;
    }

    // Remove existing widget if theme changed
    if (window.turnstile && turnstileWidgetId.current) {
      window.turnstile.remove(turnstileWidgetId.current);
      turnstileWidgetId.current = null;
    }

    // Initialize Turnstile widget
    const initTurnstile = () => {
      if (window.turnstile && !turnstileWidgetId.current) {
        turnstileWidgetId.current = window.turnstile.render('#turnstile-container', {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            setTurnstileToken(token);
          },
          'error-callback': () => {
            setError('Turnstile verification failed. Please try again.');
          },
          'expired-callback': () => {
            setTurnstileToken('');
          },
          theme: theme === 'dark' ? 'dark' : 'light',
        });
      }
    };

    // Wait for Turnstile script to load
    if (window.turnstile) {
      initTurnstile();
    } else {
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          initTurnstile();
          clearInterval(checkTurnstile);
        }
      }, 100);

      return () => clearInterval(checkTurnstile);
    }
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!turnstileToken) {
      setError('Please complete the verification');
      return;
    }

    setIsLoading(true);

    try {
      await login(username, password, turnstileToken);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      // Reset Turnstile on error
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
      setTurnstileToken('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${theme === 'dark' ? LOGIN_BACKGROUND_DARK : LOGIN_BACKGROUND_LIGHT})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--cds-spacing-07)',
      }}
    >
      <Header aria-label="LMS Header">
        <HeaderName href="/" prefix="">
          Library Management System
        </HeaderName>
        <HeaderNavigation aria-label="Header Navigation" style={{ marginLeft: 'auto' }}>
          <HeaderMenuItem onClick={() => navigate('/terms')}>
            Terms of Conditions
          </HeaderMenuItem>
          <HeaderMenuItem onClick={() => navigate('/privacy')}>
            Privacy
          </HeaderMenuItem>
        </HeaderNavigation>
      </Header>

      <Tile style={{ maxWidth: '450px', width: '100%', minWidth: '300px' }}>
        <Stack gap={7}>
          <h2 className="cds--type-productive-heading-04">Login to LMS</h2>

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError('')}
              lowContrast
            />
          )}

          <FluidForm onSubmit={handleSubmit}>
            <Stack gap={6}>
              <TextInput
                id="username"
                labelText="Username or Email"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <TextInput
                id="password"
                type="password"
                labelText="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {TURNSTILE_SITE_KEY && (
                <div id="turnstile-container" style={{ marginTop: 'var(--cds-spacing-05)' }}></div>
              )}
              <Button type="submit" disabled={isLoading || !turnstileToken} renderIcon={LoginIcon}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </FluidForm>
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="Notice"
            subtitle="This web application was made for in partial completion of I.T. Workshop."
            style={{ marginTop: 'var(--cds-spacing-05)', maxWidth: '100%' }}
          />
        </Stack>
      </Tile>
    </div>
  );
}

export default Login;
