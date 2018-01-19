<template>
    <div class="login">
        <form class="form-horizontal">
            <div class="panel-body">
                <div class="form-group">
                    <label class="col-sm-3 control-label" for="username">用户名</label>
                    <div class="col-sm-6">
                        <input type="text" placeholder="用户名" id="username" v-model="username" class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label" for="password">密码</label>
                    <div class="col-sm-6">
                        <input @keyup.enter='loginClick' type="password" placeholder="密码" id="password" v-model="password" class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label btn_holder"></label>
                    <div class="col-sm-6">
                        <button class="btn btn-warning" @click="loginClick" type="button">登录</button>
                        <button class="btn btn-info" @click="registerClick" type="button">注册</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    data(){
        return {
            username: '',
            password: '',
        }
    },
    methods: {
        loginClick: function(){
            let username = this.username;
            let password = this.password;
            Me.chat.post('/login', {username, password})
                .then(ret => {
                    if(ret.code == 0) {
                        alert(ret.errMessage)
                        return
                    }
                    let me = {name: username}
                    localStorage.me = JSON.stringify(me);
                    this.$router.push({name: 'index', params: me})
                })
                .catch(err => {
                    alert(JSON.stringify(err))
                })
        },
        registerClick: function(){
            
        }
    }
}
</script>

<style lang="scss" scoped>
    .login {
        margin-top: 100px;
    }
    @media screen and (max-width: 768px){
        .btn_holder {
            display: none;
        }
        .login {
            margin-top: 0;
        }
    }
</style>
