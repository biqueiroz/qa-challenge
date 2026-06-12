import { defineConfig } from 'cypress'

export default defineConfig({
  video: true,
  videoCompression: false,
  screenshotOnRunFailure: true,

  e2e: {
    baseUrl: 'http://lojaebac.ebaconline.art.br',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000
  }
})