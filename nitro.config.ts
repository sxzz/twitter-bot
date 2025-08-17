export default defineNitroConfig({
  compatibilityDate: '2025-08-18',
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        module: 'preserve',
        moduleDetection: 'force',
        isolatedModules: true,
        verbatimModuleSyntax: true,
      },
    },
  },
})
