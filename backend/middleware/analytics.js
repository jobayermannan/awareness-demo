const analyticsMiddleware = (req, res, next) => {
  // Log request details for analytics
  const requestData = {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date(),
    headers: {
      referer: req.get('Referer'),
      acceptLanguage: req.get('Accept-Language')
    }
  };
  
  // Attach analytics data to request object
  req.analytics = requestData;
  
  // Log the request (in production, you might want to use a proper logging service)
  console.log(`📊 Analytics: ${req.method} ${req.url} from ${requestData.ip}`);
  
  next();
};

module.exports = {
  analyticsMiddleware
};
