/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-27 09:38:19
 * @Description:
 */
import { MD5_encrypt, sha512_encrypt } from '@/utils/encrypt'
import { ElDialog, ElForm, ElFormItem, ElInput, ElScrollbar, ElRow, ElCol, ElButton, FormInstance } from 'element-plus'
import { useUserSessionStore } from '@/stores/userSession'

export default defineComponent({
    props: {
        title: {
            type: String,
            require: false,
            default: 'IDCS_SUPER_USER_CERTIFICATION_RIGHT',
        },
        tip: {
            type: String,
            require: false,
            default: '',
        },
        btnOkText: {
            type: String,
            require: false,
            default: 'IDCS_OK',
        },
        callBack: {
            type: Function,
            require: false,
            default: () => {},
        },
        beforCloseCallback: {
            type: Function as PropType<(done: () => void) => void | Promise<void>>,
            require: false,
            default: (done: () => {}) => {
                done()
            },
        },
        close: {
            type: Function,
            require: true,
            default: () => {},
        },
    },
    setup(props: any) {
        const { Translate } = inject('appGlobalProp') as appGlobalProp
        const userSessionStore = useUserSessionStore()
        const formRef = ref<FormInstance>()
        const formData = ref({} as Record<string, string>)
        const validate = {
            validateUserName: (rule: any, value: any, callback: any) => {
                if (value.length == 0) {
                    callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                    return
                }
                callback()
            },
            validatePassword: (rule: any, value: any, callback: any) => {
                if (value.length == 0) {
                    callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                    return
                }
                callback()
            },
        }

        const rules = ref({
            userName: [{ validator: validate.validateUserName, trigger: 'manual' }],
        })

        const save = () => {
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    let md5Pwd = MD5_encrypt(formData.value.password)
                    let nonce = userSessionStore.nonce ? userSessionStore.nonce : ''
                    let hexHash = sha512_encrypt(md5Pwd + '#' + nonce)
                    props.callBack(formData.value.userName, hexHash, formData.value.password)
                }
            })
        }

        const opened = () => {
            formData.value = {}
            formRef.value?.clearValidate()
        }

        return {
            formRef,
            formData,
            rules,
            save,
            opened,
        }
    },
    components: {
        ElDialog,
        ElForm,
        ElFormItem,
        ElInput,
        ElScrollbar,
        ElRow,
        ElCol,
        ElButton,
    },
})
