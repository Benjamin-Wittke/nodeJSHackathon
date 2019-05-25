const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const util = require('util');

var MongoClient = require('mongodb').MongoClient;

//DB stuff
const dev_db_url = 'mongodb://hackathonfrankfurtbb:sPwLyMSDDSPdwIAzI8hsNQkW6iWVJUrJVAB5fJOV1Z4KB6WP2OTJHNglqxpJU3r8IRptGU8aWIJr89hEa7QVYQ==@hackathonfrankfurtbb.documents.azure.com:10255/?ssl=true&replicaSet=globaldb';
const dbName = "hackathonfrankfurtbb";

async function dbGet(url, dbName, queryParam) {
    var re = new RegExp("/"+queryParam+"/");

    var test = await
    MongoClient.connect(url, {useNewUrlParser: true}, (err, db) => {
        db.db(dbName).collection('chatrooms').find({}).toArray(function(err, result) {
        //in results nach Chatroom parsen mit queryParam als einer der Member
        for (var i = 0;  i < result.length; i++){

           if(result[i].members.match(queryParam)){
               return result[i];
           }
        }
        db.close();
    });
    }
)
}


async function dbPost(url, object, dbName) {
    var test = await
    MongoClient.connect(url, {useNewUrlParser: true}, (err, db) => {
        db.db(dbName).collection('chatrooms').insertOne(object, function (err, res) {
        console.log("1 document inserted");
        db.close();
    });
})
}
//Example: dbPost(dev_db_url, room, dbName);

//IO Stuff
io.on('connection', (socket) => {
    console.log(socket.nickname);
    //get the Channel where the Nickname is in
    var room = dbGet(dev_db_url, dbName, socket.nickname);
    console.log("Raum: " + room.name);
    socket.join(room.name);

socket.on('disconnect', function () {
    io.to(room.name).emit('users-changed', {user: socket.nickname, event: 'left'});
});

socket.on('set-nickname', (nickname) => {
    socket.nickname = nickname;
io.to(room.name).emit('users-changed', {user: nickname, event: 'joined'});
})
;

socket.on('add-message', (message) => {
    io.to(room.name).emit('message', {text: message.text, from: socket.nickname, created: new Date()});
})
;
})
;

var port = process.env.PORT || 3001;

http.listen(port, function () {
    console.log('listening in http://localhost:' + port);
});