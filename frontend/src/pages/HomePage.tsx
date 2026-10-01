import { useState, useEffect } from 'react';
import {
  Grid,
  Column,
  Stack,
  Tile,
  InlineLoading,
} from '@carbon/react';
import {
  Book,
  UserMultiple,
  Alarm,
  Checkmark,
  Money,
  ArrowUp,
  ArrowDown,
} from '@carbon/icons-react';
import { api } from '../services/api';
import type { ReportStats } from '../types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: { value: number; direction: 'up' | 'down' };
  color?: string;
}

function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  return (
    <Tile
      style={{
        border: '1px solid var(--cds-border-subtle-01, #e0e0e0)',
      }}>
      <Stack gap={5} style={{ alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%',
            position: 'relative',
          }}>
          <div className={`stat-card-icon ${color || ''}`}>{icon}</div>
          {trend && (
            <div
              className={`stat-trend ${trend.direction}`}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
              }}>
              {trend.direction === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div style={{ marginTop: 'var(--cds-spacing-05)', textAlign: 'center' }}>
          <div
            className="cds--type-productive-heading-05"
            style={{ marginBottom: 'var(--cds-spacing-02)' }}>
            {value}
          </div>
          <div className="cds--type-label-01 cds--text-secondary">{label}</div>
        </div>
      </Stack>
    </Tile>
  );
}

function HomePage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.getReports();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <InlineLoading description="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  const totalBooks = stats?.totalBooks || 0;
  const issuedBooks = stats?.issuedBooks || 0;
  const availableBooks = totalBooks - issuedBooks;
  const overdueBooks = stats?.overdueBooks || 0;
  const finesPending = stats?.finesPending || 0;

  return (
    <Grid fullWidth>
      <Column lg={16} md={8} sm={4}>
        <div style={{ marginBottom: 'var(--cds-spacing-06)' }}>
          <h1 className="cds--type-productive-heading-05" style={{ marginBottom: 'var(--cds-spacing-03)' }}>
            Library Dashboard
          </h1>
          <p className="cds--type-body-compact-01 cds--text-secondary">
            Real-time overview of library operations and metrics
          </p>
        </div>
      </Column>

      <Column lg={8} md={4} sm={2} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <StatCard
          icon={<Book size={32} />}
          label="Total Books in Collection"
          value={totalBooks}
          color="icon-blue"
        />
      </Column>
      <Column lg={8} md={4} sm={2} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <StatCard
          icon={<Checkmark size={32} />}
          label="Books Currently Issued"
          value={issuedBooks}
          color="icon-green"
        />
      </Column>
      
      <Column lg={8} md={4} sm={2} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <StatCard
          icon={<Book size={32} />}
          label="Books Available"
          value={availableBooks}
          color="icon-teal"
        />
      </Column>
	
      <Column lg={8} md={4} sm={2} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <StatCard
          icon={<Alarm size={32} />}
          label="Overdue Books"
          value={overdueBooks}
          color={overdueBooks > 0 ? 'icon-red' : 'icon-gray'}
        />
      </Column>
      
      <Column lg={8} md={4} sm={2} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <StatCard
          icon={<UserMultiple size={32} />}
          label="Total Members"
          value={stats?.totalMembers || 0}
          color="icon-purple"
        />
      </Column>
      <Column lg={8} md={4} sm={2} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <StatCard
          icon={<Money size={32} />}
          label="Fines Pending Collection"
          value={`₹${finesPending.toFixed(2)}`}
          color={finesPending > 0 ? 'icon-yellow' : 'icon-gray'}
        />
      </Column>

      <Column lg={8} md={4} sm={4} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
        <Tile
          style={{
            height: '100%',
            border: '1px solid var(--cds-border-subtle-01, #e0e0e0)',
          }}>
          <Stack gap={6}>
            <div>
              <h3 className="cds--type-productive-heading-03">Financial Overview</h3>
              <p
                className="cds--type-body-compact-01 cds--text-secondary"
                style={{ marginTop: 'var(--cds-spacing-02)' }}>
                Fine collection status
              </p>
            </div>
            <Stack gap={5}>
              <div
                style={{
                  padding: 'var(--cds-spacing-05)',
                  background: 'var(--cds-layer-02)',
                  borderRadius: 'var(--cds-spacing-02)',
                }}>
                <div className="cds--type-label-01 cds--text-secondary">Pending Collection</div>
                <div
                  className="cds--type-heading-04"
                  style={{
                    color: finesPending > 0 ? 'var(--cds-support-warning)' : 'var(--cds-text-secondary)',
                  }}>
                  ₹{finesPending.toFixed(2)}
                </div>
              </div>
            </Stack>
          </Stack>
        </Tile>
      </Column>
    </Grid>
  );
}

export default HomePage;
