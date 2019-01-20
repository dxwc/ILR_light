let router = require('express').Router();

router.all('*', (req, res) =>
{
    res.status(404).render('error', { info : `Nothings here on this link` })
});

module.exports = router;