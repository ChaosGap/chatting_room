<template>
  <div class="chatroom">
      <div class="main">
          <div class="left">
              <div class="users">
                  <select @change="room_change" v-model='room_id' data-placeholder="Choose a room" >
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
                      {{talking.postDate}}
                  </div>
                  <div class="message">
                      {{talking.name}} :  {{talking.message}}
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
          users: [],
          words: '',
          t: '',
          talkings: [],
          allrooms: [],
          room_id: ''
      }
  },
  mounted() {
      Me.chat.get('/rooms')
        .then(ret => {
            console.log(ret)
                this.allrooms = ret.data
                this.room_id = this.allrooms[0].room_id
        })
        .catch(err => {
            alert(err)
        })
      this.me = this.getMyMessage();
      this.t = io('http://localhost:8090/io_home');
      var t = this.t;
      t.emit('add_user', this.me)
      t.on('room_message', obj => {
          obj.name = obj.name || '神秘人';
          obj.postDate = new Date(obj.postDate).toLocaleString();
          this.talkings.push(obj)
      })
      t.on('room_user_change', obj => {
          this.users = obj;
      })

      window.onunload = _ => {
          t.emit('remove_user', this.me)
      }
  },
  methods: {
      say: function(e) {
          if(this.words.trim() == '') {
              this.words = '';
              return;
          }
          // 清空 textarea， 输出到 content，并且给服务器发送消息
          this.t.emit('toRoom', {
              name: this.me.name,
              message: this.words
          })
          this.words = '';
      },
      getMyMessage: function() {
          return JSON.parse(localStorage.me)
      },
      room_change: function(e){
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
