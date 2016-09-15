'use strict';

const correiosController = require('../controllers/correios');

module.exports = (router) => {

  router.get('/', correiosController.index)
  	    .get('/findInfoAddressByParams', correiosController.findInfoAddressByParams);
};