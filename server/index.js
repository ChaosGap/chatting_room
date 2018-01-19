const koa = require('koa')

const app = new koa()

app.keys = ['this is a chating room', 'this is my app key']

const server = require('http').Server(app.callback())

const io = require('socket.io')(server)

const io_home = io.of('/io_home')

const io_game = io.of('/io_game')

const allRooms = [
    {room_id: 'io_home', room_name: '公众聊天室'},
    {room_id: 'io_game', room_name: '王者开黑聊天组'}
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

// 返回所有房间列表
router.get('/rooms', ctx => {
    console.log('received a request ===>>> get allrooms ===>>> ', allRooms);
    ctx.body = {
        code: 0,
        data: allRooms,
        errMessage: 'get rooms ok'
    }
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

let allUsers = [];

function sliceUsers(username) {
    allUsers.forEach((ele, index) => {
        if(ele.name == username) {
            console.log('find the user')
            allUsers.splice(index, 1);
        }
        return;
    })
}

io_home.on('connection', Socket => {
    // 添加新用户
    Socket.on('add_user', obj => {
        console.log('a new guest is comming =====>>>>>',  obj)
        sliceUsers(obj.name)
        allUsers.push(obj);
        io_home.emit('room_user_change', allUsers)
        console.log(allUsers)
    })
    // 离开房间
    Socket.on('remove_user', obj => {
        console.log('a guest is gone =====>>>>>',  obj)
        sliceUsers(obj.name)
        console.log(allUsers)
        io_home.emit('room_user_change', allUsers)
    })
    // 房间消息
    Socket.on('toRoom', data => {
        console.log('received a room message from ' + data.name + ' say: ==>> ' + data.message)
        let name = data.name;
        let message = data.message;
        let postDate = new Date().getTime();
        io_home.emit('room_message', {
            name,
            message,
            postDate
        })
    })    

    Socket.on('change_room', data => {
        
    })
})
