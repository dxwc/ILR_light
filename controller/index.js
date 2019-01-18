let router = require('express').Router();

router.use(require('./404.js')); // last route

module.exports = router;