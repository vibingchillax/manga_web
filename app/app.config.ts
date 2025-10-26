export default defineAppConfig({
  appUrl: process.env.APP_URL ?? 'http://localhost',
  proxyUrl: process.env.PROXY_URL ??  'http://localhost:1234',
  kuboGatewayUrl: process.env.APP_URL ? `${process.env.APP_URL}:8080/ipfs` : `http://localhost:8080/ipfs`,
  kuboApiUrl: `http://${process.env.NODE_ENV === 'production' ? 'kubo' : 'localhost'}:5001/api/v0`,

  messageOfTheDay: 'Hello world!'
})