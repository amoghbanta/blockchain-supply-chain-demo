import react from "@vitejs/plugin-react";
import { defineConfig, transformWithEsbuild, loadEnv } from "vite";
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import federation from '@originjs/vite-plugin-federation'

dotenvExpand.expand(dotenv.config())

/*
  custom plugin to transform js to jsx
*/
const jsToJsx = () => {
  return {
    name: "treat-js-files-as-jsx",
    async transform(code:string, id:string) {
      if (!id.match(/src\/.*\.js$/)) return null;

      // Use the exposed transform from vite, instead of directly
      // transforming with esbuild
      return transformWithEsbuild(code, id, {
        loader: "jsx",
        jsx: "automatic",
      });
    },
  };
};


export default defineConfig({
    build: {
      rollupOptions: {
        external: [],
      },
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false
    },
    plugins: [
      react(),
      jsToJsx(),
      federation({
        name: "common",
        filename: "remoteEntry.js",
        exposes: {
          './BlockSupplyChain': './src/App'
        },
        shared: ['react','react-dom']
      })
    ],
    base: process.env.NODE_ENV == 'production' ? 'https://playground-common-components.s3.eu-north-1.amazonaws.com' : 'http://localhost:4176',
});