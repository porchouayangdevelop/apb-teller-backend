import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
  fastify.addHook('onRequest', (req, reply, done) => {
    if (process.env.NODE_ENV === 'production') {
      const isHttps = req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https';
      if (!isHttps) {

        const host = req.headers.host ? req.headers.host.split(':')[0] : req.hostname || req.ip;
        const httpUrl = `https://${host}:443${req.url}`;

        reply.redirect(301, httpUrl);
        return;
      }
    }
    done();
  });
});