module.exports = {
  apps: [
    {
      name: "shop",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/ubuntu/shopping-cart-claude",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
