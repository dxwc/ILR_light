let uuid  = require('uuid/v4');
let Event = require('events');

global.streams =
{
    /*
    <stream uuid> :
    {
        video_id : <video id>,
        duration: <time in seconds>,
        start_time : <time in seconds>,
        viewers : new Event()
    }
    */
}

setInterval(() =>
{
    Object.keys(global.streams).forEach((key) =>
    {
        let a_stream = global.streams[key];
        if
        (
            (new Date().getTime() - a_stream.start_time)/1000 >
            a_stream.duration
        )
        {
            let viewers = a_stream.viewers;
            viewers.eventNames().forEach((v) => viewers.emit(v, true));
            delete global.streams[key];
        }
        else
        {
            let viewers = a_stream.viewers;
            viewers.eventNames().forEach((v) => viewers.emit(v));
        }
    })
}, 1000)

module.exports.create_stream = (video_id, duration) =>
{
    let stream_id = uuid();

    global.streams[stream_id] =
    {
        video_id : video_id,
        duration : duration,
        start_time : new Date().getTime() + 10000, // + 1 minute to start
        viewers : new Event()
    }

    return stream_id;
}