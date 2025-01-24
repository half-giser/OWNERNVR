/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:20:34
 * @Description: FTP配置
 */
import { NetFTPForm, type NetFTPList } from '@/types/apiType/net'
import { type FormRules } from 'element-plus'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
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
            switchOptions: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            // 显示排程管理弹窗
            isSchedulePop: false,
        })

        const formRef = useFormRef()
        const formData = ref(new NetFTPForm())
        const formRule = ref<FormRules>({
            serverAddr: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_DDNS_SERVER_ADDR_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            port: [
                {
                    validator: (_rule, value: number, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_RTSP_PORT_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            userName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!formData.value.anonymousSwitch && !value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!formData.value.anonymousSwitch && pageData.value.passwordSwitch && !value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            maxSize: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (value === null || value === '') {
                            callback(new Error(Translate('IDCS_MAX_FILE_SIZE_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            path: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!checkDir(value.trim())) {
                            callback(new Error(Translate('IDCS_REMOTE_DIRECTORY_ILLEGAL')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
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
            pageData.value.scheduleOptions = await buildScheduleList()
        }

        /**
         * @description 启用状态改变
         */
        const changeSwitch = () => {
            if (formData.value.switch) {
                openMessageBox(Translate('IDCS_RTSP_OR_FTP_ENABLE_REMIND'))
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
                const $content = queryXml($('content')[0].element)
                formData.value.switch = $content('switch').text().bool()
                formData.value.serverAddr = $content('serverAddr').text()
                formData.value.port = $content('port').text().num()
                formData.value.userName = $content('userName').text()
                formData.value.anonymousSwitch = $content('anonymousSwitch').text().bool()
                formData.value.maxSize = $content('maxSize').text().num() || 64
                formData.value.path = $content('path').text()
                formData.value.disNetUpLoad = $content('disNetUpLoad').text().bool()

                pageData.value.minFileSize = $content('maxSize').attr('min').num() || 0
                pageData.value.maxFileSize = $content('maxSize').attr('max').num() || 4096

                tableData.value = $content('chls/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        chlNum: $item('chlNum').text(),
                        name: $item('name').text(),
                        streamType: $item('streamType').text(),
                        schedule: $item('ftpRecSwitch/schedule').attr('id'),
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
                    <switch>${formData.value.switch}</switch>
                    <serverAddr>${wrapCDATA(formData.value.serverAddr)}</serverAddr>
                    <port>${formData.value.port}</port>
                    <userName>${wrapCDATA(formData.value.userName)}</userName>
                    ${pageData.value.passwordSwitch ? `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSession.sesionKey))}</password>` : ''}
                    <anonymousSwitch>${formData.value.anonymousSwitch}</anonymousSwitch>
                    <maxSize min="${pageData.value.minFileSize}" max="${pageData.value.maxFileSize}">${formData.value.maxSize}</maxSize>
                    <path>${formData.value.path}</path>
                    <disNetUpLoad>${formData.value.disNetUpLoad}</disNetUpLoad>
                    ${isTest ? '' : `<chls type='list'>${chlXml}</chls>`}
                </content>
            `
            return sendXml
        }

        /**
         * @description 测试
         */
        const test = () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }
                openLoading()

                const result = await testFTPCfg(getXmlData(true))
                const $ = queryXml(result)

                if ($('status').text() === 'success') {
                    openMessageBox(Translate('IDCS_FTP_TEST_SUCCESS'))
                } else {
                    openMessageBox(Translate('IDCS_FTP_TEST_FAIL'))
                }

                closeLoading()
            })
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            openLoading()

            const result = await editFTPCfg(getXmlData())
            commSaveResponseHandler(result)

            closeLoading()
        }

        /**
         * @description 验证
         */
        const verify = () => {
            // TODO: 未启用情况下 如果一些表单项为空，提交会报错. 原项目也是如此
            if (formData.value.switch) {
                formRef.value!.validate((valid) => {
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
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            tableData.value.forEach((item) => {
                item.schedule = getScheduleId(pageData.value.scheduleOptions, item.schedule)
            })
        }

        const handleRowClassName = () => {
            return formData.value.switch ? '' : 'disabled'
        }

        onMounted(async () => {
            openLoading()

            await getScheduleList()
            await getData()

            closeLoading()
        })

        return {
            formRef,
            formData,
            formRule,
            pageData,
            tableData,
            changeAllSwitch,
            manageSchedule,
            closeSchedulePop,
            test,
            verify,
            formatServerAddress,
            formatDir,
            changeSwitch,
            handleRowClassName,
        }
    },
})
