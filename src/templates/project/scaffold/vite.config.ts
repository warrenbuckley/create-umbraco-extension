import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/bundle.manifests.ts',
      fileName: 'bundle.manifests',
      formats: ['es'],
    },
    outDir: 'wwwroot/App_Plugins/{{PROJECT_NAME}}',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
