/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-28 15:28:54
 * @Description: 限制input数值输入范围（v-numericalRange:[响应式数据源data].数据索引dataKey="[minimumValue, maximumValue]"）
 */
import { App } from 'vue'

export const regNumericalRange = (app: App<Element>) => {
    app.directive('numericalRange', (_el, binding) => {
        if (!(binding.arg && binding.value)) return
        let data: any = binding.arg // 响应式数据源 data
        let dataKey: string = '' // 数据索引 dataKey
        for (let key in binding.modifiers) {
            if (binding.modifiers[key]) {
                dataKey = key
            }
        }
        let currentValue = data[dataKey]
        let minimumValue = binding.value[0]
        let maximumValue = binding.value[1]
        if (String(currentValue) !== '') {
            if (currentValue < minimumValue) data[dataKey] = minimumValue
            if (currentValue > maximumValue) data[dataKey] = maximumValue
        }
    })
}
