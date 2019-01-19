let router = require('express').Router();
let model = require('../model/');

router.get('/', (req, res) =>
{
    res.render('home');
});

/**
 * Issue 1:
 * + Trust duration information sent from client
 * + Downlod a yotube page per request and with enough users get blacklisted
 * Chosen:
 * + Trust client sent info
 */
router.post('/', (req, res) =>
{
    if
    (
        !req.body.id ||
        !(new RegExp(`[a-zA-Z0-9_\\-]{11}`)).test(req.body.id) ||
        typeof(req.body.duration) !== 'number' ||
        req.body.duration <= 0
    )
    {
        return res.status(400).json({});
    }

    return res.json
    ({ stream_id : model.create_stream(req.body.id, req.body.duration)});

});

module.exports = router;