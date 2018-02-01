const koa = require('koa')

const app = new koa()

const server = require('http').Server(app.callback())

const io = require('socket.io')(server)

server.listen(8090, _ => {
    console.log('listening on port 8090');
})

const router = require('koa-router')();

const bodyParser = require('koa-bodyparser');

const Controller = require('./controller.js');

app.use(bodyParser());

// 登录验证
router.post('/login', async ctx => {
    let { username, password } = ctx.request.body;
    ctx.status = 200;
    let code = 0;
    let errMessage = '用户民或密码错误';
    if(await Controller.isRightfulUser(username, password)) {
        code = 1;
        errMessage = '成功登陆 OK'
    }
    ctx.body = {
        code,
        errMessage
    }
})

// 得到房间列表
router.get('/rooms', async ctx => {
    let status = 200;
    let code = 1;
    let errMessage = '';
    await Controller.getAllRooms()
        .then(ret => {
            errMessage = ret;
        })
        .catch(err => {
            status = 500;
            code = 0;
            errMessage = 'Internal Wrong ' + err;
        })
    ctx.status = status;
    ctx.body = {
        code,
        errMessage
    }
})

// 得到某个房间详细信息
router.get('/room/users', async ctx => {
    let room_id = ctx.query.room_id;
    let status = 200;
    let code = 1;
    let errMessage = '';
    try {
        errMessage = await Controller.getRoomInfo(room_id);
    }catch(err) {
        status = 400;
        code = 0;
        errMessage = err;
        console.log('get /room/users error => ', err)
    }
    ctx.status = status;
    ctx.body = {
        code,
        errMessage
    }
})

app.use(router.routes())

io.on('connection', Socket => {
    /**
     * 用户加入房间
     */
    Socket.on('joinRoom', OBJ => {
        let SocketId = Socket.id;  // 用户唯一标识符  需要和  用户名做对应
        Controller.setSocketIDByUsername(OBJ.username, SocketId);
        Controller.userJoinRoom(OBJ.username, OBJ.room_id);
        Controller.addRoomUser(OBJ.username, OBJ.room_id);
        io.to(OBJ.room_id).emit(`a new user ${OBJ.username} is comming`);
    })
    /**
     * 用户离开房间
     */
    Socket.on('leaveRoom', OBJ => {
        Controller.userLeaveRoom(OBJ.username, OBJ.room_id);
        Controller.removeRoomUser(OBJ.username, OBJ.room_id);
    })
    /**
     * 房间消息
     */
    Socket.on('roomMessage', OBJ => {
        Controller.addRoomMessage(OBJ.from_user, OBJ.to_room, OBJ.message);
        OBJ.date = new Date().getTime();
        io.to(OBJ.to_room).emit('roomMessage', OBJ)
    })
    /**
     * 私聊消息
     */
    Socket.on('personalMessage', async OBJ => {
        Controller.addPersonalMessage(OBJ.from_user, OBJ.to_user, OBJ.message);
        OBJ.date = new Date().getTime();
        let SocketId = await Controller.getSocketIDByUsername(OBJ.username);
        Socket.broadcast.to(SocketId).emit('personalMessage', OBJ)
    })
})
