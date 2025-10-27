import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ---------------------------------------------------------------------
// ✅ FIXES:
//   - Added proxy for /socket.io to Flask backend
//   - Enables WebSocket forwarding during dev (port 5173 → 5001)
// ---------------------------------------------------------------------
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
