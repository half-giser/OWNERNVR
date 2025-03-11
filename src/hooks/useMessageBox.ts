/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-23 15:30:05
 * @Description: 消息提示弹框
 */
import BaseImgSprite from '@/components/sprite/BaseImgSprite.vue'

const IconMap: Record<MessageTipBoxOption['type'], number> = {
    success: 0,
    error: 1,
    info: 2,
    alarm: 3,
    question: 4,
}

// 默认是否显示取消按钮
const CancelBtnMap: Record<MessageTipBoxOption['type'], boolean> = {
    success: false,
    error: false,
    info: false,
    alarm: false,
    question: true,
}

// 默认标题
const TitleMap: Record<MessageTipBoxOption['type'], string> = {
    success: 'IDCS_SUCCESS_TIP',
    error: 'IDCS_INFO_TIP',
    info: 'IDCS_INFO_TIP',
    alarm: 'IDCS_INFO_TIP',
    question: 'IDCS_INFO_TIP',
}

/**
 * @description
 * @param {MessageTipBoxOption | string} opt opt为string时，默认为type=info的message
 * @returns
 */
export const openMessageBox = (opt: MessageTipBoxOption | string) => {
    const { Translate } = useLangStore()
    const layoutStore = useLayoutStore()

    const option: MessageTipBoxOption =
        typeof opt === 'string'
            ? {
                  type: 'info',
                  message: opt,
              }
            : opt
    if (!option.type) option.type = 'info'

    const optionObj = {
        title: Translate(TitleMap[option.type]),
        dangerouslyUseHTMLString: false, // 是否将message作为HTML片段处理
        showCancelButton: typeof option.showCancelButton === 'boolean' ? option.showCancelButton : CancelBtnMap[option.type], // 是否显示取消按钮
        confirmButtonText: Translate('IDCS_OK'), // 确定按钮的文本内容
        cancelButtonText: Translate('IDCS_CANCEL'), // 取消按钮的文本内容
        ...option,
    }

    const msgContent: {
        class: string
        innerHTML?: string
        innerText?: string
    } = {
        class: 'Msg_Content',
    }

    if (optionObj.dangerouslyUseHTMLString) {
        msgContent.innerHTML = sanitize(optionObj.message)
    } else {
        msgContent.innerText = optionObj.message
    }

    layoutStore.messageBoxCount++
    return ElMessageBox({
        title: optionObj.title,
        message: h('div', { class: 'Msg' }, [h(BaseImgSprite, { class: 'Msg_Icon', chunk: 5, file: 'msg_type', index: IconMap[optionObj.type] }), h('div', msgContent)]),
        dangerouslyUseHTMLString: true,
        draggable: true,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        showConfirmButton: true,
        showCancelButton: optionObj.showCancelButton,
        confirmButtonText: optionObj.confirmButtonText,
        cancelButtonText: optionObj.cancelButtonText,
        beforeClose: optionObj.beforeClose,
    })
        .then((e) => {
            if (layoutStore.messageBoxCount > 0) layoutStore.messageBoxCount--
            return Promise.resolve(e)
        })
        .catch((e) => {
            if (layoutStore.messageBoxCount > 0) layoutStore.messageBoxCount--
            if (option.type === 'question') {
                return Promise.reject(e)
            } else {
                return Promise.resolve(e)
            }
        })
}
