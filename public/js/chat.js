var socket = io.connect('/');

function chat(room, name) {
    socket.on('connected', function() {
        socket.json.emit('init', { 'room': room, 'name': name });
    });

    socket.on('message', function(data) {
        if (data) {
            update(data);
        }
    });
}
function send(name) {
    var data = $('#comment').val();

    socket.json.send(data);

    $('#comment').val("");
}
function update(data) {
    var obj = $(document.createElement('div'));
    obj.html(data);
    $('#view').append(obj);
}

