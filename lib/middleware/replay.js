let _ = require('lodash');

module.exports = replay;

/**
 * Returns a middleware to inject headers to be replayed given the number
 * of times and the pattern
 * @return {Function} The express middleware
 */
function replay() {
  let recordedList = [];

  return function(req, res, next) {
    try {
      // add recorded request
      let times = parseInt(req.headers['x-mock-replay'] || 0);
      let pattern = req.headers['x-mock-replay-pattern'];

      for (let i = 0; i < times; ++i) {
        recordedList.push({
          pattern: new RegExp(pattern || _.escapeRegExp(req.originalUrl)),
          headers: _.pickBy(req.headers, replayable),
        });
      }

      if (times === 0) {
        // get first matching recorded request, if any, and apply
        for (let j = 0; j < recordedList.length; ++j) {
          if (req.originalUrl.match(recordedList[j].pattern)) {
            _.assign(req.headers, recordedList[j].headers);
            recordedList.splice(j, 1);
            break;
          }
        }
      }
    } catch (ex) {
      console.log(ex.stack);
    }

    next();
  };
}

function replayable(value, header) {
  return header.match(/^x-mock/) && !header.match(/^x-mock-replay/);
}
