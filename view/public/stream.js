sse = new EventSource('/data/' + window.location.pathname.substr(8));

sse.onerror = (e) =>
{
    console.log('Err, closing connection');
    sse.close();
};

sse.onmessage = (e) =>
{
    let data = JSON.parse(e.data);
    console.log('Recived', data);
    if(data.end)
    {
        console.log('Closing connection');
        sse.close();
    }
}