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
    });
}, 1000)

module.exports.create_stream = (video_id, duration, wait) =>
{
    let stream_id = uuid();

    if(typeof(wait) === 'number' && wait > 0.5 && wait < 5) wait = 60000 * wait;
    else wait = 30000; // default, 30 seconds

    global.streams[stream_id] =
    {
        video_id : video_id,
        duration : duration,
        start_time : new Date().getTime() + wait,
        viewers : new Event()
    }

    return stream_id;
}