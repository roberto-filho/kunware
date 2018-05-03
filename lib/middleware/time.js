module.exports = time;

// delay request by time specified in header
function time(req, res, next) {
  let delay = parseInt(req.headers['x-mock-time'] || 0);
  setTimeout(next, delay);
}
