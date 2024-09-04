/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 18:01:16
 * @Description: 创建磁盘阵列弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 17:04:27
 */
import { type DiskPhysicalList, DiskCreateRaidForm } from '@/types/apiType/disk'
import { type FormInstance, type FormRules } from 'element-plus'
import BaseCheckAuthPop, { type UserCheckAuthForm } from '../../components/auth/BaseCheckAuthPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    props: {
        /**
         * @property 物理磁盘数据列表
         */
        list: {
            type: Array as PropType<DiskPhysicalList[]>,
            required: true,
        },
        /**
         * @property 阵列类型选项
         */
        raidType: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const formRef = ref<FormInstance>()

        const formData = ref(new DiskCreateRaidForm())

        const pageData = ref({
            isCheckAuth: false,
        })

        const rules = ref<FormRules>({
            name: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_NOTE_CONFIG_RAID_NAME')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            type: [
                {
                    validator: (rule, value: string, callback) => {
                        const length = formData.value.diskId.length
                        switch (value) {
                            case 'RAID_TYPE_0':
                                if (length < 2) {
                                    callback(new Error(Translate('IDCS_NOTE_RAID0_DISK_ERROR')))
                                    return
                                }
                                break
                            case 'RAID_TYPE_1':
                                if (length !== 2) {
                                    callback(new Error(Translate('IDCS_NOTE_RAID1_DISK_ERROR')))
                                    return
                                }
                                break
                            case 'RAID_TYPE_5':
                                if (length < 3) {
                                    callback(new Error(Translate('IDCS_NOTE_RAID5_DISK_ERROR')))
                                    return
                                }
                                break
                            case 'RAID_TYPE_6':
                                if (length < 4) {
                                    callback(new Error(Translate('IDCS_NOTE_RAID10_DISK_ERROR_MIN')))
                                    return
                                }
                                if (length % 2 !== 0) {
                                    callback(new Error(Translate('IDCS_NOTE_RAID10_DISK_ERROR_MAX')))
                                    return
                                }
                                break
                            default:
                                break
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 名称格式的过滤
         * @param {string} str
         * @returns {string}
         */
        const formatChar = (str: string) => {
            return str.replace(/[^a-zA-Z][^-_a-zA-Z0-9]+/, '')
        }

        /**
         * @description 物理磁盘选项
         */
        const diskOptions = computed(() => {
            return prop.list.filter((item) => item.type === 'normal')
        })

        /**
         * @description 全局热备盘
         */
        const hotDisks = computed(() => {
            return prop.list.filter((item) => item.type === 'spareHard')
        })

        /**
         * @description 验证表单，验证成功后打开鉴权弹窗
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    pageData.value.isCheckAuth = true
                }
            })
        }

        /**
         * @description 确认创建磁盘阵列
         * @param {UserCheckAuthForm} e
         */
        const confirmCreateRaid = async (e: UserCheckAuthForm) => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <content>
                    <raidInfo>
                        <name>${formData.value.name}</name>
                        <raidType>${formData.value.type}</raidType>
                        <disks>${formData.value.diskId.map((id) => `<item>${id}</item>`).join('')}</disks>
                        <isNeedFormat>true</isNeedFormat>
                    </raidInfo>
                    <auth>
                        <userName>${e.userName}</userName>
                        <password>${e.hexHash}</password>
                    </auth>
                </content>
            `

            // TODO 需要测试数据
            const result = await createRaid(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                const errorCode = Number($('/response/errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                    case ErrorCode.USER_ERROR_NO_USER:
                        errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_NOTE_CONFIG_RAID_NAME_REPEAT')
                        break
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        errorInfo = Translate('IDCS_NOTE_BEYOND_MAX_RAID_NUM')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description 打开弹窗时更新表单
         */
        const open = () => {
            formRef.value?.clearValidate()
            formData.value = new DiskCreateRaidForm()
            formData.value.diskId = prop.list.filter((item) => item.switch).map((item) => item.id)
            getRaidCapacity()
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 获取RAID容量
         */
        const getRaidCapacity = async () => {
            if (!formData.value.diskId.length) {
                formData.value.space = '0 GB'
            }
            const sendXml = rawXml`
                <content>
                    <raidType>${formData.value.type}</raidType>
                    <diskList>${formData.value.diskId.map((id) => `<item>${id}</item>`).join('')}</diskList>
                </content>
            `
            const result = await queryCreateRaidCapacity(sendXml)
            const $ = queryXml(result)
            formData.value.space = Math.floor(Number($('/response/content/capacity').text()) / 1024) + ' GB'
        }

        return {
            verify,
            close,
            open,
            formatChar,
            formData,
            formRef,
            rules,
            BaseCheckAuthPop,
            diskOptions,
            hotDisks,
            getRaidCapacity,
            pageData,
            confirmCreateRaid,
        }
    },
})
