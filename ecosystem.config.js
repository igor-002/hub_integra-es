// PM2 — Hub Integrações
// Uso: pm2 start ecosystem.config.js   (após `npm run build`)
module.exports = {
  apps: [
    {
      name: "hub-integracoes",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: "3002",
      },
    },
  ],
};
