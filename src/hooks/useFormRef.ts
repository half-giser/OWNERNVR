/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-28 13:35:24
 * @Description: 改写FormInstance.vadidate, 实现表单校验每次只校验一个字段，且错误信息自动渐变消失效果.
 */
import type { FormInstance } from 'element-plus'

export const useFormRef = () => {
    const formRef = ref<FormInstance>()

    let timer: NodeJS.Timeout | number = 0

    const stopWatch = watchEffect(() => {
        if (!formRef.value) {
            return
        }

        formRef.value.validate = async (callback?: (isValid: boolean) => void) => {
            clearTimeout(timer)

            formRef.value!.fields.forEach((item) => {
                const selector = item.$el?.querySelector('.el-form-item__error')
                if (selector) {
                    selector.classList.remove('base-fade-out')
                }
            })

            let valid = false

            for (const field of formRef.value!.fields) {
                if (field.prop) {
                    try {
                        await formRef.value!.validateField(field.prop)
                        valid = true
                        continue
                    } catch {
                        valid = false
                        timer = setTimeout(() => {
                            const selector = field.$el?.querySelector('.el-form-item__error')
                            if (selector) {
                                selector.classList.add('base-fade-out')
                                selector.addEventListener('animationend', () => {
                                    formRef.value!.clearValidate(field.prop)
                                })
                            }
                        }, 200)
                        break
                    }
                }
            }

            if (callback) {
                callback(valid)
            }

            return valid
        }

        stopWatch()
    })

    onBeforeUnmount(() => {
        clearTimeout(timer)
    })

    return formRef
}
