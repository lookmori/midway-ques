module.exports = {
  apps: [{
    name: 'midway-ques',
    script: 'bootstrap.js',
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 7001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 7001
    }
  }]
}; 