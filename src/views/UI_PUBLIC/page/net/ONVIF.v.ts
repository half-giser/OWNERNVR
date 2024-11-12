/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 18:18:50
 * @Description: OVNIF
 */
import { NetOnvifForm, NetOnvifUserList } from '@/types/apiType/net'
import ONVIFUserAddPop from './ONVIFUserAddPop.vue'

export default defineComponent({
    components: {
        ONVIFUserAddPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        // 用户类型与文本的映射
        const USER_LEVEL_MAPPING: Record<string, string> = {
            video: Translate('IDCS_VIDEO_USER'),
            operator: Translate('IDCS_OPERATE_USER'),
            admin: Translate('IDCS_NORMAL_ADMIN'),
        }

        const pageData = ref({
            // 是否显示创建/修改用户弹窗
            isUserPop: false,
            // 创建用户/修改用户
            userPopType: 'add',
            // 编辑的弹窗数据
            userData: new NetOnvifUserList(),
        })

        const formData = ref(new NetOnvifForm())

        const tableData = ref<NetOnvifUserList[]>([])

        /**
         * @description 显示用户类型文本
         * @param {String} level
         * @returns {String}
         */
        const displayUserLevel = (level: string) => {
            return USER_LEVEL_MAPPING[level]
        }

        /**
         * @description 获取OVNIF配置
         */
        const getOnvifConfig = async () => {
            const result = await queryOnvifCfg()
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                formData.value.switch = $('//content/switch').text().toBoolean()
            }
        }

        /**
         * @description 获取是否启用RTSP
         * @returns {Boolean}
         */
        const getRtspSwitch = async () => {
            const result = await queryRTSPServer()
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                return $('//content/rtspServerSwitch').text().toBoolean()
            }
            return false
        }

        /**
         * @description 获取ONVIF用户列表
         */
        const getUserList = async () => {
            const result = await queryOnvifUserList()
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                tableData.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        userName: $item('userName').text(),
                        userLevel: $item('userLevel').text(),
                        password: $item('password').text(),
                    }
                })
            }
        }

        /**
         * @description 删除用户
         * @param {NetOnvifUserList} item
         */
        const deleteUser = (item: NetOnvifUserList) => {
            openMessageBox({
                type: 'info',
                message: Translate('IDCS_USER_DELETE_USER_S').formatForLang(item.userName),
            }).then(async () => {
                openLoading()

                const sendXml = rawXml`
                    <content>
                        <item id="${item.id}"></item>
                    </content>
                `
                await deleteOnivfUser(sendXml)
                await getUserList()

                closeLoading()
            })
        }

        /**
         * @description 删除所有用户
         */
        const deleteAllUser = () => {
            openMessageBox({
                type: 'info',
                message: Translate('IDCS_DELETE_ALL_ONVIF_USER_TIP'),
            }).then(async () => {
                openLoading()

                const itemXml = tableData.value.map((item) => `<item id="${item.id}"></item>`).join('')
                const sendXml = `<content>${itemXml}</content>`

                await deleteOnivfUser(sendXml)
                await getUserList()

                closeLoading()
            })
        }

        /**
         * @description 新增用户
         */
        const addUser = () => {
            pageData.value.isUserPop = true
            pageData.value.userPopType = 'add'
        }

        /**
         * @description 编辑用户
         * @param {NetOnvifUserList} item
         */
        const editUser = (item: NetOnvifUserList) => {
            pageData.value.isUserPop = true
            pageData.value.userData = item
            pageData.value.userPopType = 'edit'
        }

        /**
         * @description 确认新增/修改用户，更新用户列表
         */
        const confirmUser = () => {
            pageData.value.isUserPop = false
            getUserList()
        }

        /**
         * @description 更新OVNIF配置
         * @param {Boolean} isAutoOpenRtsp 是否同步开启rtsp开关
         */
        const setData = async (isAutoOpenRtsp: boolean) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <switch>${formData.value.switch}</switch>
                    ${ternary(isAutoOpenRtsp, `<autoOpenRtsp>true</autoOpenRtsp>`, '')}
                </content>
            `
            await editOnvifCfg(sendXml)

            closeLoading()
        }

        /**
         * @description 验证表单后，更新ONVIF配置
         */
        const verify = () => {
            if (formData.value.switch) {
                const rtspSwitch = getRtspSwitch()
                if (!rtspSwitch) {
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_ENABLE_API_AFTER_RTSP_TIP'),
                    })
                        .then(() => {
                            setData(true)
                        })
                        .catch(() => {
                            setData(false)
                        })
                } else {
                    setData(false)
                }
            } else {
                setData(false)
            }
        }

        onMounted(async () => {
            openLoading()

            await getOnvifConfig()
            await getUserList()

            closeLoading()
        })

        return {
            pageData,
            formData,
            tableData,
            deleteUser,
            deleteAllUser,
            displayUserLevel,
            verify,
            addUser,
            editUser,
            confirmUser,
            ONVIFUserAddPop,
        }
    },
})
