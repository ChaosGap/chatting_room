const mongoose = require('mongoose');

const db = mongoose.createConnection('mongodb://localhost/chat')

const users_model = db.model('users', new mongoose.Schema({
    username: String,
    password: String,
    rooms: Array,
    current_room: String
}))

const rooms_model = db.model('rooms', new mongoose.Schema({
    room_id: String,
    room_name: String,
    users: Array
}))

const room_messages_model = db.model('room_messages', new mongoose.Schema({
    from_user: String,
    to_room: String,
    message: String,
    time: String
}))

const person_message_model = db.model('person_message', new mongoose.Schema({
    from_user: String,
    to_user: String,
    message: String,
    time: String 
}))

module.exports = {
    users_model,
    rooms_model,
    room_messages_model,
    person_message_model
}
