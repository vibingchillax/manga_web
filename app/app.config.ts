export default defineAppConfig({
  proxyUrl: 'http://localhost:1234',
  kuboUrl: `http://localhost:${process.env.KUBO_API_PORT}`
})