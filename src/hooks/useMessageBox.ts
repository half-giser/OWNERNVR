/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-23 15:30:05
 * @Description: 消息提示弹框
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-17 08:55:19
 */

import BaseImgSprite from '@/views/UI_PUBLIC/components/sprite/BaseImgSprite.vue'
import { useLangStore } from '@/stores/lang'

export default () => {
    const { Translate } = useLangStore()
    const layoutStore = useLayoutStore()

    const IconMap: Record<MessageTipBoxOption['type'], number> = {
        success: 0,
        error: 1,
        info: 2,
        alarm: 3,
        question: 4,
    }
    const TitleMap: Record<MessageTipBoxOption['type'], string> = {
        success: Translate('IDCS_SUCCESS_TIP'),
        error: Translate('IDCS_INFO_TIP'),
        info: Translate('IDCS_INFO_TIP'),
        alarm: Translate('IDCS_INFO_TIP'),
        question: Translate('IDCS_INFO_TIP'),
    }
    const openMessageTipBox = (option: MessageTipBoxOption) => {
        const optionObj = {
            // type: 'success', // 弹框类型：成功/失败/信息/警告/问题
            // title: '', // 标题
            // message: '', // 内容
            title: TitleMap[option.type],
            dangerouslyUseHTMLString: true, // 是否将message作为HTML片段处理
            draggable: true, // 是否可拖拽
            closeOnClickModal: false, // 是否可通过点击遮罩层关闭MessageBox
            closeOnPressEscape: false, // 是否可通过按下ESC键关闭MessageBox
            showConfirmButton: true, // 是否显示确定按钮
            showCancelButton: true, // 是否显示取消按钮
            confirmButtonText: Translate('IDCS_OK'), // 确定按钮的文本内容
            cancelButtonText: Translate('IDCS_CANCEL'), // 取消按钮的文本内容
            ...option,
        }

        layoutStore.messageBoxCount++
        return ElMessageBox({
            title: optionObj.title,
            message: h('div', { class: 'Mgs_box' }, [
                h(BaseImgSprite, { class: 'Msg_Icon', chunk: 5, file: 'msg_type', index: IconMap[optionObj.type] }),
                h('div', { class: 'Msg_Content', innerHTML: optionObj.message }),
            ]),
            dangerouslyUseHTMLString: optionObj.dangerouslyUseHTMLString,
            draggable: optionObj.draggable,
            closeOnClickModal: optionObj.closeOnClickModal,
            closeOnPressEscape: optionObj.closeOnPressEscape,
            showConfirmButton: optionObj.showConfirmButton,
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
                return Promise.reject(e)
            })
    }

    return { openMessageTipBox, count: layoutStore.messageBoxCount }
}
