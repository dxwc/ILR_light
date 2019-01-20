// <check loded> ------------------------------------------------------------
let api_loaded = false;
let dom_loaded = false;

setTimeout(() =>
{
    if(!api_loaded || !dom_loaded)
    {
        try { document.getElementById('loading').removeAttribute('style'); }
        catch(err) { console.error(err) }
    }
}, 100);

let check_loaded = setInterval(() =>
{
    if(api_loaded && dom_loaded)
    {
        clearInterval(check_loaded);
        try
        {
            let loading = document.getElementById('loading');
            loading.parentNode.removeChild(loading);
        }
        catch(err)
        {
            console.error(err);
        }
    }
}, 200);
// </check loded> -----------------------------------------------------------


// <iframe API functions> ---------------------------------------------------
function onYouTubeIframeAPIReady()
{
    api_loaded = true;
    window.vid_player = new YT.Player
    (
        'vid',
        {
            playerVars :
            {
                origin : window.location.href,
                autoply : 0
            },
            events :
            {
                'onReady'       : onPlayerReady,
                'onStateChange' : onStateChange,
                'onError'       : onError
            }
        }
    );
}

function onPlayerReady(e)
{
    e.target.mute();
    e.target.playVideo();
}

function onStateChange(e)
{
    if(e.data == YT.PlayerState.PLAYING)
    {
        send_data
        (
            e.target.getVideoData().video_id,
            e.target.getDuration(),
            document.getElementById('sec').value
        );
        e.target.stopVideo();
    }
}

function onError(e)
{
    let info = document.getElementById('info');
    if(e.data === 150 || e.data === 101)
    {
        info.innerHTML =
        `Sorry. ` +
        `Either an invalid video url or owner doesn't allow it to be watched here.`;
    }
    else if(e.data)
    {
        info.innerHTML =
        `Video can not be used. There was an error loading it`;
    }
}
// </iframe API functions> --------------------------------------------------

// <send data> --------------------------------------------------------------
function send_data(id, duration, wait)
{
    console.log(id, duration);
    let info = document.getElementById('info');
    return Promise.resolve()
    .then(() =>
    {
        info.innerHTML = 'Sending request to server...'
        return fetch
        (
            '/',
            {
                method : 'POST',
                body : JSON.stringify({ id : id, duration : duration, wait : wait }),
                headers : { 'Content-Type' : 'application/json' }
            }
        );
    })
    .then((res) => res.json())
    .then((res) =>
    {
        if(!res.stream_id) throw new Error('Did not recieve stream id');
        info.innerHTML = '✓ Redirecting to stream page...';
        setTimeout(() => window.location.href = '/stream/' + res.stream_id, 300);
    })
    .catch((err) =>
    {
        info.innerHTML = 'Sorry, recieved an unexpected response back from server';
        console.error(err);
    });
}
// </send data> -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () =>
{
    dom_loaded = true;

    let inp  = document.getElementById('inp');
    let send = document.getElementById('send');
    let info = document.getElementById('info');
    let img = document.getElementById('img');

    send.addEventListener('click', process_url);

    function process_url()
    {
        info.innerHTML = '';
        window.vid_player.pauseVideo();
        info.removeAttribute('style');
        img.removeAttribute('style');

        let id = get_video_id(inp.value);
        if(!id) info.innerHTML = 'Invalid URL, need a YouTube video URL';
        else
        {
            img.style =
                `background: ` +
                `url(https://img.youtube.com/vi/${id}/maxresdefault.jpg) ` +
                `no-repeat center center fixed; ` +
                `-webkit-background-size: cover; ` +
                `-moz-background-size: cover; ` +
                `-o-background-size: cover;` +
                `background-size: cover;`;
            info.innerHTML = 'Checking if video is usable...';
            window.vid_player.loadVideoById(id);
            window.vid_player.mute();
        }
    }

    // <get_video_id > --------------------------------------------------------
    const format_1 = new RegExp
    (
        `^https:\\/\\/(?:www|m)\\.youtube\\.com\\/watch\\?` +
        `(?:.+\\&|)v=([a-zA-Z0-9_\\-]{11})(?:(\\&.*)|$)`
    );

    const format_2 = new RegExp
    (
        `^https:\\/\\/youtu.be\\/([a-zA-Z0-9_\\-]{11})`
    );

    const format_3 = new RegExp
    (
        `^https:\\/\\/www\\.(?:youtube|youtube\\-nocookie)*\\.com\\/embed\\/` +
        `([a-zA-Z0-9_\\-]{11})`
    );

    function get_video_id(url)
    {
        if(!url || url.constructor !== String) return null;

        let arr = url.match(format_1);
        if(arr) return arr[1];

        arr = url.match(format_2);
        if(arr) return arr[1];

        arr = url.match(format_3);
        if(arr) return arr[1];

        return null;
    }
    // </get_video_id > --------------------------------------------------------
});