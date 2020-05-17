var socket =io('http://localhost:8080');
socket.on('chat-message',function(data){
    console.log(data);
})