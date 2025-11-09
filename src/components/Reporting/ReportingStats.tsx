import { useEffect, useState } from 'react';
import { getReportStats } from '../../utilities/graphqlClient';
import { ReportFilters } from './ReportingFilters';
import './ReportingStats.css';

interface StatData {
  report_type: string;
  count: number;
  unique_users: number;
  unique_sessions: number;
}

interface ReportingStatsProps {
  filters?: ReportFilters;
}

export function ReportingStats({ filters }: ReportingStatsProps) {
  const [stats, setStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);

      try {
        const result = await getReportStats(filters);

        if (result.errors) {
          setError('Failed to load statistics');
          return;
        }

        if (result.data?.getReportStats) {
          setStats(result.data.getReportStats);
        }
      } catch (err) {
        setError('Failed to load statistics');
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [filters]);

  if (loading) {
    return (
      <div className="reporting-stats reporting-stats--loading">
        Loading statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="reporting-stats reporting-stats--error">{error}</div>
    );
  }

  const totalReports = stats.reduce((sum, stat) => sum + stat.count, 0);
  const totalUsers = Math.max(...stats.map((s) => s.unique_users), 0);
  const totalSessions = Math.max(...stats.map((s) => s.unique_sessions), 0);

  return (
    <div className="reporting-stats">
      <h3 className="reporting-stats__title">Statistics</h3>

      <div className="reporting-stats__summary">
        <div className="reporting-stats__summary-card">
          <div className="reporting-stats__summary-value">{totalReports}</div>
          <div className="reporting-stats__summary-label">Total Reports</div>
        </div>

        <div className="reporting-stats__summary-card">
          <div className="reporting-stats__summary-value">{totalUsers}</div>
          <div className="reporting-stats__summary-label">Unique Users</div>
        </div>

        <div className="reporting-stats__summary-card">
          <div className="reporting-stats__summary-value">{totalSessions}</div>
          <div className="reporting-stats__summary-label">Unique Sessions</div>
        </div>
      </div>

      <div className="reporting-stats__breakdown">
        <h4>Reports by Type</h4>
        {stats.length === 0 ? (
          <p>No reports found</p>
        ) : (
          <table className="reporting-stats__table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th>Unique Users</th>
                <th>Unique Sessions</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr
                  key={stat.report_type}
                  className={`reporting-stats__row--${stat.report_type}`}
                >
                  <td className="reporting-stats__type">{stat.report_type}</td>
                  <td>{stat.count}</td>
                  <td>{stat.unique_users}</td>
                  <td>{stat.unique_sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ReportingStats;
