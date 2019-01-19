sse = new EventSource
('/data/' + window.location.pathname.substr(8));
sse.onerror = (e) => console.error('Error -->', e);
sse.onmessage = (e) =>
{
    console.log('Recived', JSON.parse(e.data));
}