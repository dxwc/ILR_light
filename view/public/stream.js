// <iframe API functions> -----------------------------------------------
function onYouTubeIframeAPIReady()
{
    api_loaded = true;
    window.vid_player = new YT.Player
    (
        'vid',
        {
            height: window.innerWidth * (9/16),
            width: window.innerWidth,
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

window.yt_ready = false;
function onPlayerReady(e)
{
    window.yt_ready = true;
}

window.player_is_visible = false;
function onStateChange(e)
{
    if
    (
        !window.player_is_visible &&
        (
            e.data === YT.PlayerState.PLAYING   ||
            e.data === YT.PlayerState.BUFFERING
        )
    )
    {
        document.getElementById('vid').removeAttribute('style');
        window.player_is_visible = true;
        document.getElementById('info').innerHTML = '';
        let inp_box = document.getElementById('inp_box');
        inp_box.parentNode.removeChild(inp_box);
    }
}

function onError(e)
{
    console.error(e.data);
}
// </iframe API functions> ----------------------------------------------

window.dom_loaded = false;
document.addEventListener('DOMContentLoaded', () =>
{
    window.dom_loaded = true;
    window.info_node = document.getElementById('info');
});

// <server sent event> --------------------------------------------------
sse = new EventSource('/data/' + window.location.pathname.substr(8));

function close_sse()
{
    if(sse)
    {
        if(!window.player_is_visible)
            window.info_node.innerHTML = `Error, closing connection`;
        console.log('Closing connection');
        sse.close();
    }
    setTimeout(() => delete sse);
}

sse.onerror = close_sse;

window.already_cued = false;
sse.onmessage = (e) =>
{
    if(!(yt_ready && window.dom_loaded)) return;

    let data;
    try        { data = JSON.parse(e.data) }
    catch(err) { close_sse() }

    if(!data.video_id || !typeof(data.play_at) === 'number') return close_sse();

    if(data.play_at < -2)
    {
        window.info_node.innerHTML = `Video will start in ` +
        `${Math.round((-data.play_at) - 2)} seconds for everyone here`;
        if(!window.already_cued)
        {
            window.already_cued = true;
            window.vid_player.cueVideoById(data.video_id);
            document.getElementById('img').style =
                `background: ` +
                `url(https://img.youtube.com/vi/${data.video_id}/maxresdefault.jpg) `+
                `no-repeat center center fixed; ` +
                `-webkit-background-size: cover; ` +
                `-moz-background-size: cover; ` +
                `-o-background-size: cover;` +
                `background-size: cover;`;
        }
    }
    else if(window.vid_player.getPlayerState() === YT.PlayerState.CUED)
    {
        window.info_node = '';
        window.vid_player.playVideo();
    }
    else if
    (
        window.vid_player.getPlayerState() !== YT.PlayerState.PAUSED &&
        window.vid_player.getPlayerState() !== YT.PlayerState.BUFFERING
    )
    {
        window.info_node = '';
        if(window.vid_player.getVideoData().video_id !== data.video_id)
        {
            window.vid_player.loadVideoById(data.video_id, data.play_at);
        }
        else if
        (!is_in_range(window.vid_player.getCurrentTime(), data.play_at, 1.3))
        {
            window.vid_player.seekTo(data.play_at);
        }
    }
}

function is_in_range(num, target, plus_or_minus)
{
    return num >= target - plus_or_minus && num <= target + plus_or_minus ;
}
// </server sent event> --------------------------------------------------