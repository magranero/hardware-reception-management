module.exports = {
  apps: [
    {
      name: 'datacenter-api',
      script: '../server/index.js',
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
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      error_file: '../logs/pm2/error.log',
      out_file: '../logs/pm2/output.log'
    }
  ]
};