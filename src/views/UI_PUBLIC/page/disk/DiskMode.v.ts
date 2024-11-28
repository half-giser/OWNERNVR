/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:41:45
 * @Description: 磁盘模式
 */
import { DiskModeForm } from '@/types/apiType/disk'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import type { UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        const pageData = ref({
            // 鉴权弹窗
            isAuthDialog: false,
        })
        const formData = ref(new DiskModeForm())

        /**
         * @description 改变磁盘模式时，弹窗确认弹窗
         */
        const changeDiskMode = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_CHANGE_RAID_USE_TIP'),
            })
                .then(() => {
                    pageData.value.isAuthDialog = true
                })
                .catch(() => {
                    formData.value.enable = !formData.value.enable
                })
        }

        /**
         * @description 权限认证通过后，更新数据
         */
        const setData = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <diskMode>
                        <isUseRaid>${formData.value.enable}</isUseRaid>
                    </diskMode>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editDiskMode(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isAuthDialog = false
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                    case ErrorCode.USER_ERROR_NO_USER:
                        errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        break
                }

                if (errorInfo) {
                    openMessageBox({
                        type: 'info',
                        message: errorInfo,
                    })
                }
            }
        }

        /**
         * @description 关闭权限弹窗时，重置表单
         */
        const close = () => {
            pageData.value.isAuthDialog = false
            getData()
        }

        /**
         * @description 获取表单数据
         */
        const getData = async () => {
            const result = await queryDiskMode()
            const $ = queryXml(result)
            formData.value.enable = $('content/diskMode/isUseRaid').text().bool()
        }

        onMounted(() => {
            getData()
        })

        return {
            formData,
            pageData,
            close,
            setData,
            changeDiskMode,
            confirm,
            BaseCheckAuthPop,
        }
    },
})
