import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

// Nitro builds a plain Node server (.output/server/index.mjs), so the site
// runs the same in Docker on a laptop or on any host.
const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [nitro(), tanstackStart(), viteReact()],
})

export default config
