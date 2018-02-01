<template>
  <div class="chatroom">
      <main>
          <aside>
              <div v-for='(user, index) in users' :key='index' class="userList">
                  {{user}}
              </div>
          </aside>
          <div class="content">

          </div>
      </main>
      <footer>
          <textarea placeholder="输入你想说的话" @mousedown="say" class="words_enter" v-model="words"></textarea>
      </footer>
  </div>
</template>

<script>
export default {
  data() {
      return {
         current_room: {room_id: 'travel'},
         words: '',
         users: [],
         socket: null,
         Me: {}
      }
  },
  async mounted() {
      this.Me = JSON.parse(localStorage.me);
      this.users = (await this.getRoomUsers()).errMessage[0].users;
      this.initSocket();
      this.listenMessage();
  },
  methods: {
      initSocket: function() {
          this.socket = io('http://localhost:8090');
          this.socket.emit('joinRoom', {
              username: this.Me.name,
              room_id: 'travel'
          })
      },
      listenMessage: function() {
          this.socket.on('roomMessage', res => {
              console.log(res)
          })

          this.socket.on('personalMessage', res => {
              console.log(res)
          })
      },
      getRooms: async function(){
          try {
              return await Me.chat.get('/rooms');
          }catch(err) {
              alert('getRooms error => ', JSON.stringify(err));
              return [];
          }
      },
      getRoomUsers: async function(){
          try {
              return await Me.chat.get('/room/users', {room_id: this.current_room.room_id});
          }catch(err) {
              alert('getRoomUsers error => ', JSON.stringify(err));
              return [];
          }
      },
      say: function() {
          
      }
  }
}
</script>

<style lang="scss" scoped>
    .chatroom {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    main {
        flex: 1;
        display: flex;
        flex-direction: row;
    }
    aside {
        width: 200px;
        box-sizing: border-box;
        border-right: 1px solid #ccc;
    }
    .userList {
        line-height: 30px;
        text-align: center;
        border-bottom: 1px solid #ccc;
        margin-bottom: -1px;
    }
    .content {
        flex: 1;
    }
    footer {
        box-sizing: border-box;
        border-top: 1px solid #ccc;
        height: 100px;
    }
    .words_enter {
        height: 100%;
        width: 100%;
        border: none;
        outline: none;
        resize: none;
    }
</style>
