import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  if (!env.VITE_SITE_URL) {
    throw new Error(
      'VITE_SITE_URL environment variable is required. Please set it in your .env file or environment.'
    );
  }
  const siteUrl = env.VITE_SITE_URL;
  const analyticsScript =
    (mode === 'production' && env.VITE_ANALYTICS_SCRIPT) || '';

  return {
    plugins: [
      react(),
      tailwindcss(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            siteUrl,
            analyticsScript,
            title: 'Tech Stack Sphere - Interactive 3D Technology Visualization',
            description: 'Explore an interactive 3D sphere visualization of modern web technologies, frameworks, and tools. Built with React Three Fiber and TypeScript.',
            keywords: 'tech stack, 3D visualization, React Three Fiber, WebGL, interactive, technology, frameworks, tools, development, programming',
          },
        },
      }),
    ],
  };
});
