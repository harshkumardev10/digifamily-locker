import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Local development server middleware to execute /api serverless functions
function apiDevServer() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const urlPath = req.url?.split('?')[0]
        if (urlPath === '/api/send-otp' || urlPath === '/api/verify-otp') {
          let bodyStr = ''
          req.on('data', (chunk: any) => { bodyStr += chunk })
          req.on('end', async () => {
            let body = {}
            try { body = JSON.parse(bodyStr) } catch (_) {}

            const wrappedRes = {
              setHeader(k: string, v: string) { res.setHeader(k, v); return this; },
              status(code: number) {
                res.statusCode = code
                return {
                  json(data: any) {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(data))
                  },
                  end() { res.end() }
                }
              }
            }

            const wrappedReq = { method: req.method, body }

            try {
              if (urlPath === '/api/send-otp') {
                const { default: handler } = await import('./api/send-otp.js')
                await handler(wrappedReq, wrappedRes)
              } else {
                const { default: handler } = await import('./api/verify-otp.js')
                await handler(wrappedReq, wrappedRes)
              }
            } catch (err: any) {
              console.error('[API Dev Server Error]', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: err.message || 'Internal Dev API error' }))
            }
          })
          return
        }
        next()
      })
    }
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    figmaAssetResolver(),
    apiDevServer(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
