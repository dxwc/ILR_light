let router = require('express').Router();
let val    = require('validator');
let uuid   = require('uuid/v4');

router.get('/stream/:id', (req, res) =>
{
    if(!val.isUUID(req.params.id, 4))
        return res.status(404).send('You have a broken link');
    if(!global.streams[req.params.id])
        return res.status(404).send('Channel does not exist');
    return res.render('stream');
});

router.get('/data/:id', (req, res) =>
{
    if(!val.isUUID(req.params.id, 4)) return res.status(400).send();
    if(!global.streams[req.params.id]) return res.status(404).send();

    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');

    function event_listener(should_end)
    {
        if(should_end)
        {
            res.write(`data: ${JSON.stringify({ end : true })}\n\n`);
            return res.end();
        }

        try // if stream ends while processing (emit async)
        {
            res.write
            (
                `data: ${
                JSON.stringify
                (
                    {
                        video_id : global.streams[req.params.id].video_id,
                        play_at  :
                        (
                            new Date().getTime() -
                            global.streams[req.params.id].start_time
                        )/1000
                    }
                )}\n\n`
            );
        }
        catch(err)
        {
            console.error(err);
            try
            {
                res.write(`data: ${JSON.stringify({ end : true })}\n\n`);
                return res.end();
            }
            catch(err) { }
        }
    }

    let viewer_name = uuid();
    global.streams[req.params.id].viewers.on(viewer_name, event_listener);
    res.on('close', () =>
    {
        if(global.streams[req.params.id])
        {
            global.streams[req.params.id].viewers
            .removeListener(viewer_name, event_listener);
        }
    });
});

module.exports = router;