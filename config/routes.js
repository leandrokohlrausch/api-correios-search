'use strict';

const path = require('path');
const util = require('../app/helpers/util');

module.exports = (router) => {

  router.use((req, res, next) => {
    console.log('%s %s', req.method, req.url);
    next();
  });

  var routes = path.resolve('app/routes');
  util.eachFilesPath(routes, (file) => {
    require(routes + '/' + file)(router);
  });
};