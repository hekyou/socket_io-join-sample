/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

var port = process.env.PORT || 3000;

// Configuration

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.register('.html', require('ejs'));
    app.set('view engine', 'html');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
    res.redirect('/' + random_string(12));
});

app.get('/:room', function(req, res) {
    res.render('index', { layout: false, title: 'chatroom', port: port, room: req.params.room, name: random_string(5) });
});

app.listen(port);

// socket.io

chat = io.sockets.on('connection', function(client) {
    client.emit('connected');

    client.on('init', function(req) {
        client.set('room', req.room);
        client.set('name', req.name);
        chat.to(req.room).emit('message', req.name + " さんが入室");
        client.join(req.room);
    });

    client.on('message', function(data) {
        var room, name;

        client.get('room', function(err, _room) {
            room = _room;
        });
        client.get('name', function(err, _name) {
            name = _name;
        });

        chat.to(room).emit('message', name + ": " + data);
    });

    client.on('disconnect', function() {
        var room, name;

        client.get('room', function(err, _room) {
            room = _room;
        });
        client.get('name', function(err, _name) {
            name = _name;
        });
        client.leave(room);
        chat.to(room).emit('message', name + " さんが退出");
    });
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// function

function random_string(len) {
    var base = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    base = base.split('');
    var str = '';
    var count = base.length;
    for (var i = 0; i < len; i++) {
        str += base[Math.floor(Math.random() * count)];
    }
    return str;
}

