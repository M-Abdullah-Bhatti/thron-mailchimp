const requestIp = require("request-ip");

// inside middleware handler
const ipMiddleware = function (req, res, next) {
  const clientIp = requestIp.getClientIp(req);
  next();
};
