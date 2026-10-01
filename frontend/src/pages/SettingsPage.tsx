import { useState, useEffect } from 'react';
import {
  Grid,
  Column,
  Section,
  Heading,
  Form,
  Stack,
  TextInput,
  Button,
  InlineNotification,
} from '@carbon/react';
import { Save } from '@carbon/icons-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

function SettingsPage() {
  const { user } = useAuth();
  const [defaultBorrowingDays, setDefaultBorrowingDays] = useState('14');
  const [finePerDay, setFinePerDay] = useState('5');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response.success && response.data) {
        if (response.data.default_borrowing_days) {
          setDefaultBorrowingDays(response.data.default_borrowing_days.value);
        }
        if (response.data.fine_per_day) {
          setFinePerDay(response.data.fine_per_day.value);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load settings');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Validate inputs
    const days = parseFloat(defaultBorrowingDays);
    const fine = parseFloat(finePerDay);

    if (isNaN(days) || days <= 0) {
      setError('Default borrowing days must be a positive number');
      return;
    }

    if (isNaN(fine) || fine <= 0) {
      setError('Fine per day must be a positive number');
      return;
    }

    setIsLoading(true);
    try {
      await api.updateSettings({
        default_borrowing_days: defaultBorrowingDays,
        fine_per_day: finePerDay,
      });
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Only admins can access settings
  if (user?.role !== 'admin') {
    return (
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <Section>
            <InlineNotification
              kind="error"
              title="Access Denied"
              subtitle="You do not have permission to access this page"
              lowContrast
            />
          </Section>
        </Column>
      </Grid>
    );
  }

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <Section>
          <Heading style={{ marginBottom: 'var(--cds-spacing-06)' }}>
            System Settings
          </Heading>

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError('')}
              lowContrast
              style={{ marginBottom: 'var(--cds-spacing-05)' }}
            />
          )}

          {success && (
            <InlineNotification
              kind="success"
              title="Success"
              subtitle={success}
              lowContrast
              style={{ marginBottom: 'var(--cds-spacing-05)' }}
            />
          )}

          <Form>
            <Stack gap={7}>
              <TextInput
                id="default-borrowing-days"
                labelText="Default Borrowing Days"
                helperText="Default number of days a book can be borrowed"
                value={defaultBorrowingDays}
                onChange={(e) => setDefaultBorrowingDays(e.target.value)}
                type="number"
                min="1"
              />
              <TextInput
                id="fine-per-day"
                labelText="Fine Per Day"
                helperText="Fine amount charged per day for overdue books"
                value={finePerDay}
                onChange={(e) => setFinePerDay(e.target.value)}
                type="number"
                min="0"
                step="0.01"
              />
              <Button
                onClick={handleSave}
                disabled={isLoading}
                renderIcon={Save}
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Stack>
          </Form>
        </Section>
      </Column>
    </Grid>
  );
}

export default SettingsPage;
