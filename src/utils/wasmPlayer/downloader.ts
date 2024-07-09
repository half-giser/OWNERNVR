/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-03 11:27:10
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-03 11:29:03
 */
let ws: WebSocket | null

function setWebsocket(url: string, cmdJSON: any) {
    ws = new WebSocket(url)
    ws.binaryType = 'arraybuffer'
    ws.onopen = function () {
        console.log('downloader connect success')
    }
    ws.onmessage = function (e) {
        try {
            const res = JSON.parse(e.data)
            const url = res.url
            const resBasic = res.basic || {}
            const resData = res.data || {}
            const dataCode = resData.code
            if (url === '/device/create_connection#response' && dataCode === 0) {
                ws && ws.send(cmdJSON)
            }
            const code = dataCode || resBasic.code
            if (code && code !== 0) {
                self.postMessage({
                    cmd: 'error',
                    code: code,
                    taskID: resData.task_id,
                    url: url,
                })
            }
        } catch (error) {
            self.postMessage({
                cmd: 'feedData',
                buffer: e.data,
            })
        }
    }
    ws.onclose = function () {
        self.postMessage({
            cmd: 'close',
        })
    }
    ws.onerror = function () {
        self.postMessage({
            cmd: 'error',
            code: 'WEBSOCKET_ERROR', // 自定义错误码，表示websocket连接异常
        })
    }
}

// 处理start开启收流命令
// 当websocket连接实例处于活动状态时,复用此连接直接发命令
// 否则重新建链
function handleStart(url: string, cmdJSON: any) {
    if (ws && ws.readyState === 1) {
        ws.send(cmdJSON)
    } else {
        setWebsocket(url, cmdJSON)
    }
}

/**
 * 监听器
 */
self.onmessage = function (e) {
    const data = e.data
    switch (data.cmd) {
        case 'start':
            const url = data.data.url
            const cmdJSON = data.data.params
            handleStart(url, cmdJSON)
            break
        case 'stop':
            if (ws) {
                ws.send(data.data)
                // ws.close()
            }
            break
        case 'destroy':
            if (ws) {
                ws.close()
                ws = null
            }
            break
        case 'sendCMD':
            if (ws) {
                ws.send(data.data)
            }
            break
        default:
            break
    }
}
