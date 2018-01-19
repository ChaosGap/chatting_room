import Vue from 'vue';

class Chat_Request {
    constructor(baseurl) {
        this.baseurl = baseurl
    }

    send(params) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.baseurl + params.path,
                method: params.method,
                headers: {

                },
                data: params.data,
                success: function(ret) {
                    resolve(ret)
                },
                error: function(err) {
                    reject(err)
                }
            })
        })
    }

    get(path, data = {}) {
        return this.send({
            method: 'GET',
            path,
            data,
        })
    }

    post(path, data = {}) {
        return this.send({
            method: 'POST',
            path,
            data,
        })
    }

    put(path, data = {}) {
        return this.send({
            method: 'PUT',
            path,
            data,
        })
    }

}

const Me = {};

const baseurl = 'http://chat.com/api';

Me.chat = new Chat_Request(baseurl);

export default {
    install: Vue => {
        window.Me = Me;
    }
}
