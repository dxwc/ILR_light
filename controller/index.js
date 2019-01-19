let router = require('express').Router();

router.use(require('./home.js'));
router.use(require('./404.js')); // last route

module.exports = router;