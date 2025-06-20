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
        NODE_ENV: 'development',
        PORT: 3002,
        IP_ADDRESS: process.env.VITE_DB_SERVER || '0.0.0.0' // Use environment variable or default
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        IP_ADDRESS: process.env.VITE_DB_SERVER || '0.0.0.0' // Use environment variable or default
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      error_file: './logs/pm2/error.log',
      out_file: './logs/pm2/output.log'
    }
  ]
};