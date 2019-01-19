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

    function event_listener()
    {
        try // stream can end while processing
        {
            let stream_id = req.params.id;
            res.write
            (
                `data: ${
                JSON.stringify
                (
                    {
                        video_id : global.streams[stream_id].video_id,
                        play_at  :
                        (
                            new Date().getTime() -
                            global.streams[stream_id].start_time
                        )/1000
                    }
                )}\n\n`
            );

            if
            (
                (new Date().getTime() - global.streams[stream_id].start_time)/1000 >
                global.streams[stream_id].duration
            )
            {
                delete global.streams[stream_id];
            }
        }
        catch(err)
        {
            //
        }
    }

    try
    {
        let viewer_name = uuid();
        global.streams[req.params.id].viewers.on(viewer_name, event_listener);
        res.on('close', () =>
            global.streams[req.params.id].viewers
            .removeListener(viewer_name, event_listener));
    }
    catch(err)
    {
        //
    }

});

module.exports = router;