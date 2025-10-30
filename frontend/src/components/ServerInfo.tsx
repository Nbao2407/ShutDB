import { FC, useEffect, useState } from 'react';
import styles from './ServerInfo.module.css';

interface ServerMetrics {
  hostname: string;
  platform: string;
  uptime: number;
  totalServices: number;
  runningServices: number;
  stoppedServices: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

interface ServerInfoProps {
  metrics?: ServerMetrics;
}

export const ServerInfo: FC<ServerInfoProps> = ({ metrics }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const defaultMetrics: ServerMetrics = {
    hostname: 'localhost',
    platform: 'Windows',
    uptime: 0,
    totalServices: 0,
    runningServices: 0,
    stoppedServices: 0
  };

  const data = metrics || defaultMetrics;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Server Information</h3>
        <div className={styles.time}>
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🖥️</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Hostname</div>
            <div className={styles.cardValue}>{data.hostname}</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>💻</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Platform</div>
            <div className={styles.cardValue}>{data.platform}</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>⏱️</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Uptime</div>
            <div className={styles.cardValue}>{formatUptime(data.uptime)}</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Services</div>
            <div className={styles.cardValue}>{data.totalServices}</div>
          </div>
        </div>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <div className={styles.statusDot} data-status="running" />
          <span className={styles.statusLabel}>Running</span>
          <span className={styles.statusCount}>{data.runningServices}</span>
        </div>
        <div className={styles.statusDivider} />
        <div className={styles.statusItem}>
          <div className={styles.statusDot} data-status="stopped" />
          <span className={styles.statusLabel}>Stopped</span>
          <span className={styles.statusCount}>{data.stoppedServices}</span>
        </div>
      </div>

      {(data.cpuUsage !== undefined || data.memoryUsage !== undefined) && (
        <div className={styles.metrics}>
          {data.cpuUsage !== undefined && (
            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>CPU Usage</span>
                <span className={styles.metricValue}>{data.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${data.cpuUsage}%` }}
                  data-level={
                    data.cpuUsage > 80 ? 'high' : data.cpuUsage > 50 ? 'medium' : 'low'
                  }
                />
              </div>
            </div>
          )}
          {data.memoryUsage !== undefined && (
            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Memory Usage</span>
                <span className={styles.metricValue}>{data.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${data.memoryUsage}%` }}
                  data-level={
                    data.memoryUsage > 80 ? 'high' : data.memoryUsage > 50 ? 'medium' : 'low'
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
