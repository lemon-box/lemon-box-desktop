/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    DIST: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}