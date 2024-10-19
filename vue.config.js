const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
      .rule('srt')
      .test(/\.srt$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end()
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @use "@/assets/styles/colors" as *;
        `
      }
    }
  }
})
