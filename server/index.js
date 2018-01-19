const koa = require('koa')

const app = new koa()

app.keys = ['this is a chating room', 'this is my app key']

const server = require('http').Server(app.callback())

const io = require('socket.io')(server)

const allRooms = [
    {room_id: 'io_home', room_name: '公众聊天室'},
    {room_id: 'io_game', room_name: '王者开黑聊天组'},
    {room_id: 'io_travel', room_name: '去哪儿旅行'}
]

const roomUsers = [
    {room_id: 'io_home', users: []},
    {room_id: 'io_game', users: []},
    {room_id: 'io_travel', users: []}
]

const router = require('koa-router')()

const mongoose = require('mongoose')

const db = mongoose.createConnection('mongodb://localhost/chat')

const usersModel = db.model('users', new mongoose.Schema({
    username: String,
    nickname: String,
    password: String,
    age: Number,
    createDate: String,
    sex: String,
    email: String
}))

const uuMessageModel = db.model('uuMessages', new mongoose.Schema({
    origin: String,
    destination: String,
    message: String,
    postDate: String
}))

const cors2 = require('koa-cors2')

const bodyParser = require('koa-bodyparser')

server.listen(8090, _ => {
    console.log('server start on 8090')
})

// 解决跨域问题
app.use(cors2())

// 绑定post参数
app.use(bodyParser())

// 检测是否存在用户 await 不能处理reject
const isExistsUser = username => {
    return new Promise((resolve, reject) => {
        usersModel.find({username}, (err, data) => {
            if(err){
                console.log(err)
                resolve(true)
                return;
            }
            if(data.length == 0) {
                resolve(false)
            }else {
                resolve(true)
            }
        })
    })
}

// 根据room_id 返回房间信息
const getRoomInfo = room_id => {
    let roomInfo = {};
    roomUsers.forEach(ele => {
        if(ele.room_id == room_id) {
            roomInfo = ele;
            return;
        }
    })
    return roomInfo;
}

// 房间的用户变动 消息发送 
const userChangeMessage = (room_id, users) => {
    io.to(room_id)
        .emit('userChangeMessage', users)
}

// 房间的新消息监听  消息发送
const roomNewMessage = (room_id, OBJ) => {
    OBJ.sendDate = new Date().getTime();
    io.to(room_id)
        .emit('roomNewMessage', OBJ)
}

// 删除某个房间的用户
const deleteRoomUser = (room_id, user) => {
    try {
        getRoomInfo(room_id).users.forEach((ele, index, users) => {
            if(ele.name == user.name){
                users.splice(index, 1)
                return;
            }
        })
        userChangeMessage(room_id, getRoomInfo(room_id).users)
    }catch(err) {
        console.log(err)
    }   
}

// 给某个房间增加用户
const addRoomUser = (room_id, user) => {
    try {
        getRoomInfo(room_id).users.push(user);
        userChangeMessage(room_id, getRoomInfo(room_id).users)
    }catch(err) {
        console.log(err)
    }
}

// 返回所有房间列表
router.get('/rooms/allrooms', ctx => {
    console.log('received a request ===>>> get allrooms ===>>> allRooms = ' + allRooms.length);
    ctx.body = allRooms;
})

// 返回某个房间的用户信息
router.get('/rooms/users', ctx => {
    console.log('received a request ===>>> get roomUsers ===>>> roomUsers = ' + roomUsers.length);
    let room_id = ctx.query.room_id;
    ctx.body = getRoomInfo(room_id);
})

// 用户登录
router.post('/login', async ctx => {
    // 判断是否存在session   true -> login   false -> check is right user 
    let {username, password} = ctx.request.body;
    let status = {
        code: 0,
        errMessage: ''
    }
    await new Promise((resolve, reject) => {
        usersModel.find({username, password}, (err, data) => {
            if(err || data.length == 0){
                console.log(err)
                status.errMessage = 'err => ' + err; 
            }else {
                status.code = 1;
                status.errMessage = 'login ok';
            }
            resolve();
        })
    })
    ctx.status = 200;
    ctx.body = status;
})

// 注册用户
router.post('/register', async ctx => {
    let { username, nickname, password, age, createDate, sex, email } = ctx.request.body;
    let userInfo = {username, nickname, password, age, createDate, sex, email};
    let status = {
        code: 0,
        errMessage: ''
    }
    if(await isExistsUser(username)) {
        status.errMessage = 'user already exists';
    }else {
        await new Promise((resolve, reject) => {
            usersModel.create(userInfo, err => {
                if(err) {
                    status.errMessage = 'err' + err;
                    resolve();
                }else {
                   status.code = 1;
                   status.errMessage = `create user ${username} ok`;
                   resolve();
                }
            })
        }) 
    }
    console.log(status.errMessage);
    ctx.status = 200;
    ctx.body = status;
})

app.use(router.routes());

//  io
io.on('connection', Socket => {

    /**
     * 房间用户变动 消息监听
     * OBJ { last_room_id, room_id, user }  
     */
    Socket.on('change_room', OBJ => {
        let { last_room_id, room_id, user } = OBJ;
        try {
            console.log(last_room_id)
            Socket.leave(last_room_id)
            Socket.join(room_id)
        }catch(err) {
            console.log(err)
        }
        console.log('change_room_message ==>> ', OBJ)
        deleteRoomUser(last_room_id, user);
        addRoomUser(room_id, user);
        console.log('change_room_message ===>>> over')
    })
    /**
     * 房间新消息 消息监听
     * OBJ { room_id, user, message }  
     */
    Socket.on('client_room_message', OBJ => {
        let { room_id, user, message } = OBJ;
        console.log('client_room_message ==>> ', OBJ)
        roomNewMessage(room_id, OBJ)
        console.log('client_room_message ===>>> over')
    })

})
