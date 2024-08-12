/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 12:08:57
 * @Description: AI/事件
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-08-12 11:22:36
 */
const { Translate } = useLangStore()

/**
 * @description: 报警输出
 * @return {*}
 */
export class AlarmOut {
    id = '' //告警输出ID
    name = '' //告警输出名称
    index = '' //告警输出在设备上的序号
    devDesc = undefined as string | undefined //告警输出所在设备的描述，如果为undefined表示本机，否则表示通道的名称
    devID = undefined as string | undefined //告警输出所在设备的ID，如果为undefined表示本机，否则表示通道的ID
    delayTime = 0 //延迟时间
    scheduleId = '' //排程ID
    scheduleName = '' //排程名称
    type = '' //常开常闭类型--本机报警输出在有效
    status = '' //行状态: loading, success, error
    disabled = true //是否禁用
    // 表格中显示的序号，是devDesc-index
    get serialNum() {
        return `${this.devDesc ? this.devDesc : Translate('IDCS_LOCAL')}-${this.index}`
    }
}
