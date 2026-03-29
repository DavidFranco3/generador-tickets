import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'TicketGenerator',
      fileName: 'ticket-generator',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['jspdf', 'jspdf-autotable'],
      output: {
        globals: {
          jspdf: 'jsPDF',
          'jspdf-autotable': 'jspdfAutotable',
        },
      },
    },
  },
  plugins: [dts()],
});
