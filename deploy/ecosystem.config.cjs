module.exports = {
  apps: [
    {
      name: 'datacenter-api',
      script: 'server/index.js',
      exec_mode: 'cluster',
      instances: 'max',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        IP_ADDRESS: '127.0.0.1' // Binds only to localhost for Nginx to proxy
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      merge_logs: true,
      error_file: './logs/pm2/error.log',
      out_file: './logs/pm2/output.log',
      time: true,
      log_type: 'json',
      instance_var: 'NODE_APP_INSTANCE',
      node_args: '--max-old-space-size=1536',
      exp_backoff_restart_delay: 100,
      listen_timeout: 5000,
      kill_timeout: 5000,
      restart_delay: 3000,
      wait_ready: true
    }
  ]
};