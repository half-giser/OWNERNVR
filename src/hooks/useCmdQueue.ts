/*
 * @Date: 2025-02-24 09:14:43
 * @Description: 命令执行队列
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export const useCmdQueue = (limit = 1000) => {
    const cmdQueue: (() => Promise<void>)[] = []
    let cmdLock = false // 锁定标识：当前命令没有返回时，不能发送新的命令

    /**
     * @description 新增命令到命令队列
     * @param {CmdItem} cmd
     */
    const addCmd = (cmd: () => Promise<void>) => {
        if (cmdQueue.length > limit) {
            return
        }
        cmdQueue.push(cmd)
        if (cmdQueue.length && !cmdLock) {
            executeCmd()
        }
    }

    /**
     * @description 执行单个命令
     * @param {CmdItem} cmd
     */
    const executeCmd = async () => {
        if (!cmdQueue.length || cmdLock) {
            return
        }

        cmdLock = true

        const cmdItem = cmdQueue.shift()!
        try {
            await cmdItem()
        } catch (e) {}

        cmdLock = false
        executeCmd()
    }

    /**
     * @description 清空命令队列
     * @param {CmdItem} cmd
     */
    const clean = () => {
        cmdQueue.length = 0
    }

    onBeforeUnmount(() => {
        clean()
    })

    return {
        add: addCmd,
        execute: executeCmd,
        clean,
    }
}
