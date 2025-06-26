module.exports = {
  apps: [
    {
      name: 'datacenter-api',
      script: 'server/index.js',
      cwd: 'D:/nginx/pistolas',
      exec_mode: 'cluster',
      instances: 2, // Fixed number instead of 'max' for better stability in Windows
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
        IP_ADDRESS: '0.0.0.0',
        HEALTH_CHECK_PATH: '/health'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        IP_ADDRESS: '0.0.0.0',
        HEALTH_CHECK_PATH: '/health'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      merge_logs: true,
      error_file: 'D:/nginx/pistolas/logs/pm2/error.log',
      out_file: 'D:/nginx/pistolas/logs/pm2/output.log',
      time: true,
      log_type: 'json',
      instance_var: 'NODE_APP_INSTANCE',
      node_args: '--max-old-space-size=1536',
      exp_backoff_restart_delay: 100,
      listen_timeout: 5000,
      kill_timeout: 5000,
      restart_delay: 3000,
      wait_ready: true,
      
      // Windows-specific optimizations
      windowsHide: true,
      
      // Environment variables for logging
      combine_logs: true,
      
      // Additional PM2 monitoring
      min_uptime: '10s',
      max_restarts: 10,
      
      // Instance configuration
      increment_var: 'PORT',
      
      // Graceful shutdown
      shutdown_with_message: true
    }
  ],
  
  // Global configuration for all apps
  deploy: {
    production: {
      user: 'node',
      host: '127.0.0.1',
      ref: 'origin/main',
      repo: 'git@github.com:repo.git',
      path: 'D:/nginx/pistolas',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production'
    }
  }
};