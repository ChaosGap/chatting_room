<template>
  <div class="chatroom">
      <div class="main">
          <div class="left">
              <div class="users">
                  <select @change="changeRoom" v-model='room_id' data-placeholder="Choose a room" >
                    <option v-for='(room, index) in allrooms' :key='index' :value="room.room_id">{{room.room_name}}</option>
                  </select>
              </div>
              <div class="users" v-for="(user, index) in users" :key='index'>
                  {{user.name}}
              </div>
          </div>
          <div class="content">
              <div class="talkings" v-for='(talking, index) in talkings' :key="index">
                  <div class="postDate">
                      {{talking.sendDate | date_to_string}}
                  </div>
                  <div class="message">
                      {{talking.user.name}} :  {{talking.message}}
                  </div>
              </div>
          </div>
      </div>
      <div class="bottom">
          <textarea v-model="words" placeholder="say something" id="words" cols="30" rows="10" @keyup.enter='say'></textarea>
      </div>
  </div>
</template>

<script>
export default {
  data() {
      return {
          me: {},
          roomInfo: {},
          users: [],
          words: '',
          s: '',
          talkings: [],
          allrooms: [],
          last_room_id: '',
          room_id: ''
      }
  },
  filters: {
      date_to_string: function(time) {
          return new Date(time).toLocaleString();
      }
  },
  async mounted() {
      // 得到自身的信息
      this.me = this.getMyMessage();
      // 获取所有聊天室
      this.allrooms = await this.getAllRooms();
      // 设置当前聊天室
      this.room_id = this.allrooms[0].room_id;
      // 设置上一个聊天室 初始化时为当前聊天室
      this.last_room_id = this.room_id;
      // 创建socket链接
      this.connectSocketIO();
      // 获取当前聊天室的所有人的信息
      this.roomInfo = await this.getRoomUsers();
      this.users = this.roomInfo.users;
      // 监听 userChangeMessage 事件  ===>>>  房间用户变动消息
      this.listen_userChangeMessage();
      // 监听 当前 聊天室 所有的消息
      this.listen_roomNewMessage();
      // 离开页面之前 销毁房间的用户
      this.beforeLeaveSystem();
  },
  methods: {
      getMyMessage: function() {
          return JSON.parse(localStorage.me)
      },
      connectSocketIO: function(){
          this.s = io('http://localhost:8090');
          this.changeRoom();
      },
      getAllRooms: async function(){
          try {
              return await Me.chat.get('/rooms/allrooms');
          }catch(err) {
              console.log('getAllRooms err => ', err);
          }
      },
      getRoomUsers: async function(){
          try {
              return await Me.chat.get('/rooms/users', {room_id: this.room_id})
          }catch(err) {
              console.log('getRoomUsers err => ' + err);
          }
      },
      say: function(e) {
         if(this.words.trim() == '') {
             this.words = '';
             return;
         }
         // 发送消息
         this.s.emit('client_room_message', {
             room_id: this.room_id,
             user: this.me,
             message: this.words
         })
         this.words = '';
      },
      changeRoom: function(){
          this.s.emit('change_room', {
              last_room_id: this.last_room_id,
              room_id: this.room_id,
              user: this.me
          })
          this.last_room_id = this.room_id;
      },
      listen_userChangeMessage: function(){
          this.s.on('userChangeMessage', users => {
              console.log(users)
              this.users = users;
          }) 
      },
      listen_roomNewMessage: function(){
          this.s.on('roomNewMessage', OBJ => {
              console.log(OBJ)
              this.talkings.push(OBJ);
              this.$nextTick(_ => {
                  this.scrollToBottom();
              })
          })
      },
      scrollToBottom: function(){
          $('.content').scrollTop($('.content').height() * 2)
      },
      beforeLeaveSystem: function(){
          window.onunload = function() {
              this.s.emit('change_room', {
                  last_room_id: this.last_room_id,
                  room_id: null,
                  user: this.me
              })
          }
      }
  }
}
</script>

<style lang="scss" scoped>
    .chatroom {
        display: flex;
        height: 100%;
        flex-direction: column;
    }
    .main {
        flex: 1;
        box-sizing: border-box;
        border-bottom: 1px solid #ccc;
        display: flex;
        flex-direction: row;
    }
    .left {
        width: 200px;
        box-sizing: border-box;
        border-right: 1px solid #ccc;
        .users {
            line-height: 2;
            text-align: center;
            cursor: pointer;
            border-bottom: 1px solid rgb(66, 21, 21);
            margin-bottom: -1px;
        }
    }
    .content {
        flex: 1;
        overflow-y: auto;
    }
    .bottom {
        height: 130px;
        overflow: hidden;
    }
    .talkings {
        line-height: 2;
        padding-left: 10px;
        padding-top: 10px;
    }
    #words {
        width: 100%;
        height: 100%;
        outline: none;
        resize: none;
        border: none;
    }
</style>
