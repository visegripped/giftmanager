-- Create giftmanager database
CREATE DATABASE IF NOT EXISTS giftmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Create reports database
CREATE DATABASE IF NOT EXISTS reports CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Grant permissions to visegripped user for both databases
GRANT ALL PRIVILEGES ON giftmanager.* TO 'visegripped'@'%';
GRANT ALL PRIVILEGES ON reports.* TO 'visegripped'@'%';
FLUSH PRIVILEGES;

USE reports;

-- Create application_reports table
CREATE TABLE IF NOT EXISTS application_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  stid VARCHAR(36) NOT NULL COMMENT 'Session Transaction ID',
  userid SMALLINT,
  report_type ENUM('performance', 'interaction', 'error', 'warning', 'info', 'debug') NOT NULL,
  component VARCHAR(255),
  message TEXT,
  timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Precision to milliseconds',
  performance_metrics JSON COMMENT 'Stores timing data, API response times, etc.',
  user_agent TEXT,
  viewport_width INT,
  viewport_height INT,
  page_url TEXT,
  referrer TEXT,
  request_data JSON COMMENT 'API request details, parameters',
  response_data JSON COMMENT 'API response details',
  stack_trace TEXT,
  metadata JSON COMMENT 'Additional flexible data',
  INDEX idx_stid (stid),
  INDEX idx_userid (userid),
  INDEX idx_report_type (report_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_component (component),
  INDEX idx_userid_timestamp (userid, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

