const { users_model, rooms_model, room_messages_model, person_message_model } = require('./model.js')

/* --------------------------------  安全性校验 用户 & 房间存在判断  --------------------------------  */

/**
 * 校验用户是否存在 
 * @param {String} username 
 */
const isUserExist = async username => {
    return new Promise(async (resolve, reject) => {
        users_model.find({username}, (err, data) => {
            if(err){
                resolve(false)
            }else if(data.length == 1) {
                resolve(true)
            }else {
                resolve(false)
            }
        })
    })
}

/**
 * ============================
 *      校验房间是否存在
 * ============================
 * @param {String} room_id 
 */
const isRoomExist = async room_id => {
    return new Promise(async (resolve, reject) => {
        rooms_model.find({room_id}, (err, data) => {
            if(err){
                resolve(false)
            }else if(data.length == 1) {
                resolve(true)
            }else {
                resolve(false)
            }
        })
    })
}

/**
 * ==============================
 *      检测用户名和密码是否存在
 * ==============================
 * @param {String} username 
 * @param {String} password 
 */
const isRightfulUser = async (username, password) => {
    return new Promise(async (resolve, reject) => {
        users_model.find({username, password}, (err, data) => {
            if(err){
                resolve(false)
            }else if(data.length == 1) {
                resolve(true)
            }else {
                resolve(false)
            }
        })
    })
}

/* --------------------------------  end 安全性校验 用户 & 房间存在判断  --------------------------------  */

/**
 * 查询所有的用户
 * @param {*} _ 
 */
const getAllUsers = async _ => {
    return new Promise(async (resolve, reject) => {
        users_model.find({}, (err, data) => {
            if(err){
                reject(err)
            }else {
                resolve(data)
            }
        })
    })   
}

/**
 * 查询某一个用户的信息
 * @param {String} username 
 */
const getUserInfo = async username => {
    return new  Promise(async (resolve, reject) => {
        users_model.find({username}, (err, data) => {
            if(err){
                reject(err)
            }else {
                resolve(data)
            }
        })
    })   
}

/**
 * 添加新用户
 * @param {Object} userInfo 
 */
const addUser = async (userInfo) => {
    return new  Promise(async (resolve, reject) => {
        if(await isUserExist(userInfo.username)){
            reject('用户已经存在')
            return
        }
        users_model.create(userInfo, (err, data) => {
            if(err){
                reject(err)
            }else {
                resolve(true)
            }
        })
    })   
}

/* --------------------------------  用户加入退出房间操作  --------------------------------  */

/**
 * 用户新加入房间
 * @param {String} username 
 * @param {String} room_id 
 */
const userJoinRoom = async (username, room_id) => {
    return new Promise(async (resolve, reject) => {
        if(await isUserExist(username) && await isRoomExist(room_id)) {
            users_model.update({username}, {$push: {'rooms': room_id}}, err => {
                if(err){
                    reject(err)
                }else {
                    resolve(true)
                }
            })
        }else {
            reject('用户或者房间不存在')
        }
    })
}

/**
 * 用户退出房间
 * @param {String} username 
 * @param {String} room_id 
 */
const userLeaveRoom = async (username, room_id) => {
    return new Promise(async (resolve, reject) => {
        if(await isUserExist(username) && await isRoomExist(room_id)) {
            users_model.update({username}, {$pull: {'rooms': room_id}}, err => {
                if(err){
                    reject(err)
                }else {
                    resolve(true)
                }
            })
        }else {
            reject('用户或者房间不存在')
        }
    })
}

/**
 * 房间添加用户
 * @param {String} username 
 * @param {String} room_id 
 */
const addRoomUser = async (username, room_id) => {
    return new Promise(async (resolve, reject) => {
        if(await isUserExist(username) && await isRoomExist(room_id)) {
            rooms_model.update({room_id}, {$push: {'users': username}}, err => {
                if(err){
                    reject(err)
                }else {
                    resolve(true)
                }
            })
        }else {
            reject('用户或者房间不存在')
        }
    })
}

/**
 * 房间删除用户
 * @param {String} username 
 * @param {String} room_id 
 */
const removeRoomUser = async (username, room_id) => {
    return new Promise(async (resolve, reject) => {
        if(await isUserExist(username) && await isRoomExist(room_id)) {
            rooms_model.update({room_id}, {$pull: {'users': username}}, err => {
                if(err){
                    reject(err)
                }else {
                    resolve(true)
                }
            })
        }else {
            reject('用户或者房间不存在')
        }
    })
}

/* --------------------------------  end 用户加入退出房间操作  --------------------------------  */

/**
 * 查询所有的房间号
 * @param {*} _ 
 */
const getAllRooms = async _ => {
    return new Promise(async (resolve, reject) => {
        rooms_model.find({}, (err, data) => {
            if(err){
                reject(err)
            }else {
                resolve(data)
            }
        })
    })
}

/**
 * 添加新房间
 * @param {Object} userInfo 
 */
const addRoom = async (roomInfo) => {
    return new  Promise(async (resolve, reject) => {
        if(await isRoomExist(roomInfo.room_id)){
            reject('房间已经存在')
            return
        }
        rooms_model.create(roomInfo, (err, data) => {
            if(err){
                reject(err)
            }else {
                resolve(true)
            }
        })
    })   
}

/**
 * 返回房间信息
 * @param {String} room_id 
 */
const getRoomInfo = async (room_id) => {
    return new Promise((resolve, reject) => {
        rooms_model.find({room_id}, (err, data) => {
            if(err){
                reject(err)
            }else {
                resolve(data)
            }
        })
    })
}

/* --------------------------------  消息操作 公聊 & 私聊  --------------------------------  */

/**
 * 添加房间消息
 * @param {String} from_user 
 * @param {String} to_room 
 * @param {String} message 
 */
const addRoomMessage = async (from_user, to_room, message) => {
    let time = new Date().getTime();
    return new Promise(async (resolve, reject) => {
        if(await isUserExist(from_user) && await isRoomExist(to_room)) {
            room_messages_model.create({from_user, to_room, message, time}, err => {
                if(err)
                    reject(err)
                else 
                    resolve(true)
            })
        }else {
            reject('用户或者房间不存在')
        }
    })
}

/**
 * 添加私人消息
 * @param {String} from_user 
 * @param {String} to_user 
 * @param {String} message 
 */
const addPersonalMessage = async (from_user, to_user, message) => {
    let time = new Date().getTime();
    return new Promise(async (resolve, reject) => {
        if(await isUserExist(from_user) && await isUserExist(to_user)) {
            person_message_model.create({from_user, to_user, message, time}, err => {
                if(err)
                    reject(err)
                else 
                    resolve(true)
            })
        }else {
            reject('用户或者房间不存在')
        }
    })
}

/**
 * 设置用户名和 SocketId 的对应关系
 * @param {*} username 
 * @param {*} SocketId 
 */
const setSocketIDByUsername = async (username, SocketId) => {
    users_model.update({username}, {$set: {SocketId}}, err => {
        if(err) {
            console.log(err)
        }
    })
}

/**
 * 通过用户名查询 SocketId
 * @param {*} username 
 */
const getSocketIDByUsername = async (username) => {
    return new Promise((resolve, reject) => {
        users_model.find({username}, (err, data) => {
            if(err) {
                resolve(false)
            }else {
                resolve(data[0].SocketId);
            }
        })
    })
}

/* --------------------------------  end 消息操作 公聊 & 私聊  --------------------------------  */

module.exports = {
    isUserExist,
    isRoomExist,
    isRightfulUser,
    getAllUsers,
    getUserInfo,
    addUser,
    addRoom,
    getRoomInfo,
    getAllRooms,
    userJoinRoom,
    userLeaveRoom,
    addRoomUser,
    removeRoomUser,
    addRoomMessage,
    addPersonalMessage,
    setSocketIDByUsername,
    getSocketIDByUsername
}