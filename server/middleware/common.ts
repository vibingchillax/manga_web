export default defineEventHandler((event) => {
  event.context.clientIp = getRequestIP(event, {
    xForwardedFor: true,
  });
  event.context.userAgent = getHeader(event, "user-agent");
});
