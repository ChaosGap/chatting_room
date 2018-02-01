/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            M V V M   
 *  核心思路 => 
 *  （1）监控对象的属性变化 Observer => 通知订阅者 EventEmiter
 *  （2）扫描解析 dom节点  Compile => 根据指令 替换模板 & 绑定函数
 *  （3）
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// EventEmiter
class EventEmiter {
    constructor(){
        this.listeners = [];
    }
    on(name, fn){
        this.listeners.push([name, fn]);
    }
    emit(name, ...args) {
        this.listeners.forEach(([fn_name, fn]) => {
            if(fn_name == name) {
                fn(args)
            }
        })
    }
}

const data = {'name': 'zhou', 'age': 22};

const events = new EventEmiter();

events.on('notify', function(key) {
    console.log('some data changed => ', ...key, data[key])
    // 动态改变dom
    function changeDom(){}
})

// observer
/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *      遍历属性并添加 get & set   
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
function observer(data) {
    if(!data || typeof data !== 'object') {
        return;
    }
    Object.keys(data).forEach(key => {
        defineReactive(data, key, data[key])
    })
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *        添加 getter & setter
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * @param {*} data 
 * @param {*} key 
 * @param {*} val 
 */
function defineReactive(data, key, val) {
    observer(val)
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get: function() {
            return val;
        },
        set: function(newVal){ 
            if(val == newVal) return;
            val = newVal;
            // 应该 触发一个事件
            events.emit('notify', key)
        }
    })
}

observer(data)

data.age = 18;

data.sex = 'male'



