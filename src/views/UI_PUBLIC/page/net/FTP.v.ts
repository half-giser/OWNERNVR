/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:20:34
 * @Description: FTP配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 17:07:03
 */
import { NetFTPForm, type NetFTPList } from '@/types/apiType/net'
import { type FormInstance, type FormRules } from 'element-plus'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSession = useUserSessionStore()

        const pageData = ref({
            // 最大文件长度 最小值
            minFileSize: 0,
            // 最大文件长度 最大值
            maxFileSize: 4096,
            // 是否开启更改密码
            passwordSwitch: false,
            // 排程选项
            scheduleOptions: [] as SelectOption<string, string>[],
            // 码流类型选项
            streamTypeOptions: [
                {
                    label: Translate('IDCS_MAIN_STREAM'),
                    value: 'main',
                },
                {
                    label: Translate('IDCS_SUB_STREAM'),
                    value: 'sub',
                },
            ] as SelectOption<string, string>[],
            // 开关选项
            switchOptions: DEFAULT_SWITCH_OPTIONS.map((item) => ({ ...item, label: Translate(item.label) })),
            // 显示排程管理弹窗
            isSchedulePop: false,
        })

        const formRef1 = ref<FormInstance>()
        const formRef2 = ref<FormInstance>()
        const formData = ref(new NetFTPForm())
        const formRule = ref<FormRules>({
            serverAddr: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_DDNS_SERVER_ADDR_EMPTY')))
                            return
                        }
                        return
                    },
                    trigger: 'blur',
                },
            ],
            port: [
                {
                    validator: (rule, value, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_RTSP_PORT_EMPTY')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'blur',
                },
            ],
            userName: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!formData.value.anonymousSwitch && !value.trim().length) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'blur',
                },
            ],
            password: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!formData.value.anonymousSwitch && pageData.value.passwordSwitch && !value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'blur',
                },
            ],
            maxSize: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_MAX_FILE_SIZE_EMPTY')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'blur',
                },
            ],
            path: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!checkDir(value.trim())) {
                            callback(new Error(Translate('IDCS_REMOTE_DIRECTORY_ILLEGAL')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'blur',
                },
            ],
        })

        const tableData = ref<NetFTPList[]>([])

        /**
         * @description 远程路径合法性检测
         * @param {string} dir
         * @returns {boolean}
         */
        const checkDir = (dir: string) => {
            const reg = /(\\(?=(\\|.*\/))|\/(?=(\/|.*\\))|[^a-zA-Z\d\_\-\\\/])/gi
            return !reg.test(dir)
        }

        /**
         * @description 格式化远程路径
         * @param {string} dir
         * @returns {string}
         */
        const formatDir = (dir: string) => {
            return dir.replace(/[^a-zA-Z\d\_\-\\\/]/g, '')
        }

        /**
         * @description 格式化服务器地址
         * @param {string} str
         * @returns {string}
         */
        const formatServerAddress = (str: string) => {
            return str.replace(/[\u4e00-\u9fa5]/g, '')
        }

        /**
         * @description 获取排程选项
         */
        const getScheduleList = async () => {
            const result = await queryScheduleList()
            const $ = queryXml(result)

            if ($('/response/status').text() === 'success') {
                pageData.value.scheduleOptions = $('/response/content/item').map((item) => {
                    return {
                        label: item.text(),
                        value: item.attr('id')!,
                    }
                })
                pageData.value.scheduleOptions.push({
                    value: '{00000000-0000-0000-0000-000000000000}',
                    label: '<' + Translate('IDCS_NULL') + '>',
                })
            }
        }

        /**
         * @description 启用状态改变
         */
        const changeSwitch = () => {
            if (formData.value.switch) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_RTSP_OR_FTP_ENABLE_REMIND'),
                })
            }
        }

        /**
         * @description 一键修改表单列数据
         * @param {string} key
         * @param {string} value
         */
        const changeAllSwitch = (key: keyof NetFTPList, value: string) => {
            tableData.value.forEach((item) => {
                item[key] = value
            })
        }

        /**
         * @description 获取表单和表格数据
         */
        const getData = async () => {
            const result = await queryFTPCfg()
            commLoadResponseHandler(result, ($) => {
                const $content = queryXml($('/response/content')[0].element)
                formData.value.switch = $content('switch').text().toBoolean()
                formData.value.serverAddr = $content('serverAddr').text()
                formData.value.port = Number($content('port').text())
                formData.value.userName = $content('userName').text()
                formData.value.anonymousSwitch = $content('anonymousSwitch').text().toBoolean()
                formData.value.maxSize = Number($content('maxSize').text()) || 64
                formData.value.path = $content('path').text()
                formData.value.disNetUpLoad = $content('disNetUpLoad').text().toBoolean()

                pageData.value.minFileSize = Number($content('maxSize').attr('min')) || 0
                pageData.value.maxFileSize = Number($content('maxSize').attr('max')) || 4096

                tableData.value = $content('chls/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        chlNum: $item('chlNum').text(),
                        name: $item('name').text(),
                        streamType: $item('streamType').text(),
                        schedule: $item('ftpRecSwitch/schedule').attr('id')!,
                        motion: $item('ftpRecSwitch/motion').text(),
                        inteligence: $item('ftpRecSwitch/inteligence').text(),
                        sensor: $item('ftpRecSwitch/sensor').text(),
                        ftpSnapSwitch: $item('ftpSnapSwitch').text(),
                        ftpAlarmInfoSwitch: $item('ftpAlarmInfoSwitch').text(),
                    }
                })
            })
        }

        /**
         * @description 生成提交的XML
         * @param {boolean} isTest
         */
        const getXmlData = (isTest = false) => {
            const chlXml = tableData.value
                .map((item) => {
                    return rawXml`
                        <item id="${item.id}">
                            <name>${wrapCDATA(item.name)}</name>
                            <streamType>${item.streamType}</streamType>
                            <chlNum>${item.chlNum}</chlNum>
                            <ftpRecSwitch>
                                <schedule id="${item.schedule}"></schedule>
                                <motion>${item.motion}</motion>
                                <inteligence>${item.inteligence}</inteligence>
                                <sensor>${item.sensor}</sensor>
                            </ftpRecSwitch>
                            <ftpSnapSwitch>${item.ftpSnapSwitch}</ftpSnapSwitch>
                            <ftpAlarmInfoSwitch>${item.ftpAlarmInfoSwitch}</ftpAlarmInfoSwitch>
                        </item>
                    `
                })
                .join('')
            const sendXml = rawXml`
                <content>
                    <switch>${formData.value.switch.toString()}</switch>
                    <serverAddr>${wrapCDATA(formData.value.serverAddr)}</serverAddr>
                    <port>${formData.value.port.toString()}</port>
                    <userName>${wrapCDATA(formData.value.userName)}</userName>
                    ${pageData.value.passwordSwitch ? `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSession.sesionKey))}</password>` : ''}
                    <anonymousSwitch>${formData.value.anonymousSwitch.toString()}</anonymousSwitch>
                    <maxSize min="${pageData.value.minFileSize.toString()}" max="${pageData.value.maxFileSize.toString()}">${formData.value.maxSize.toString()}</maxSize>
                    <path>${formData.value.path}</path>
                    <disNetUpLoad>${formData.value.disNetUpLoad.toString()}</disNetUpLoad>
                    ${isTest ? '' : `<chls type='list'>${chlXml}</chls>`}
                </content>
            `
            return sendXml
        }

        /**
         * @description 测试
         */
        const test = () => {
            formRef1.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }
                openLoading(LoadingTarget.FullScreen)

                const result = await testFTPCfg(getXmlData(true))
                const $ = queryXml(result)

                if ($('/response/status').text() === 'success') {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_FTP_TEST_SUCCESS'),
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_FTP_TEST_FAIL'),
                    })
                }

                closeLoading(LoadingTarget.FullScreen)
            })
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await editFTPCfg(getXmlData())
            commSaveResponseHadler(result)

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 验证
         */
        const verify = async () => {
            // TODO: 未启用情况下 如果一些表单项为空，提交会报错. 原项目也是如此
            if (formData.value.switch) {
                formRef1.value!.validate((valid) => {
                    if (!valid) {
                        return
                    }
                    setData()
                })
                return
            }
            setData()
        }

        /**
         * @description 打开排程管理弹窗
         */
        const manageSchedule = () => {
            pageData.value.isSchedulePop = true
        }

        /**
         * @description 修改并关闭排程管理弹窗
         */
        const confirmManageSchedule = () => {
            // TODO
            pageData.value.isSchedulePop = false
            getScheduleList()
        }

        onMounted(async () => {
            openLoading(LoadingTarget.FullScreen)

            await getScheduleList()
            await getData()

            closeLoading(LoadingTarget.FullScreen)
        })

        return {
            formRef1,
            formRef2,
            formData,
            formRule,
            pageData,
            tableData,
            changeAllSwitch,
            manageSchedule,
            confirmManageSchedule,
            test,
            verify,
            formatServerAddress,
            formatDir,
            changeSwitch,
            ScheduleManagPop,
        }
    },
})
