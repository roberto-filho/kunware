let express = require('express');
let path = require('path');

// render kunware specific swagger ui
module.exports = express.Router().use(
  express.static(__dirname + '/../../public/swagger-ui/'),
  express.static(path.dirname(require.resolve('swagger-ui')))
);
