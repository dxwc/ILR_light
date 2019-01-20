// <iframe API functions> -----------------------------------------------
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
    //
}

window.player_is_visible = false;
function onStateChange(e)
{
    if
    (
        !window.player_is_visible &&
        (
            e.data == YT.PlayerState.PLAYING ||
            e.data === YT.PlayerState.BUFFERING
        )
    )
    {
        document.getElementById('vid').removeAttribute('style');
        window.player_is_visible = true;
        document.getElementById('info').innerHTML = '';
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
    if(!window.vid_player || !window.dom_loaded)
    {
        window.info_node = `Loading...`;
        return;
    }

    let data;
    try        { data = JSON.parse(e.data) }
    catch(err) { close_sse() }

    if(!data.video_id || !typeof(data.play_at) === 'number') return close_sse();

    if(data.play_at < -2)
    {
        window.info_node.innerHTML = `Video will start in ` +
                              `${Math.round((-data.play_at) - 2)} seconds`;
        if(!window.already_cued)
        {
            window.vid_player.cueVideoById(data.video_id);
            window.already_cued = true;
        }
    }
    else if(window.vid_player.getPlayerState() === YT.PlayerState.CUED)
    {
        window.info_node = '';
        window.vid_player.playVideo();
    }
    else if
    (
        window.vid_player.getPlayerState() !== YT.PlayerState.PAUSED   ||
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