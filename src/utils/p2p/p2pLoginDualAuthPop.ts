/*
 * @Date: 2025-06-04 11:26:56
 * @Description: 打开P2P双重认证弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import P2PLoginDualAuthPop from '@/views/UI_PUBLIC/page/P2PLoginDualAuthPop.vue'
import { h, render } from 'vue'

export const openP2PDualAuthLoginPop = (option: { confirm?: (data: UserDualAuthLoginForm) => void; close?: () => void; destroy?: () => void }) => {
    const container = document.createElement('div')

    const errMsg = ref(' ')
    const visible = ref(true)

    const vNode = h(P2PLoginDualAuthPop, {
        visible: visible.value,
        errMsg: errMsg.value,
        onClose() {
            nextTick(() => {
                close()

                if (option.close) {
                    option.close()
                }
            })
        },
        onDestroy: () => {
            nextTick(() => {
                if (option.destroy) {
                    option.destroy()
                }
            })
        },
        onConfirm: (data) => {
            if (option.confirm) {
                option.confirm(data)
            }
        },
    })

    render(vNode, container)
    document.body.appendChild(container)

    function close() {
        render(null, container)
        container.parentNode?.removeChild(container)
    }

    return {
        close() {
            if (typeof vNode?.component?.props.visible === 'boolean') {
                vNode.component.props.visible = false
            }
        },
        setErrorMsg(msg: string) {
            if (typeof vNode?.component?.props.errMsg === 'string') {
                vNode.component.props.errMsg = msg
            }
        },
    }
}
