/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-18 09:33:12
 * @Description: 开机向导
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-04 11:48:18
 */
import { SystemGuideLangForm, SysmteGuidePrivacyForm, SystemGuideUserForm, SystemGuideDateTimeForm, SystemGuideQuestionForm, type SystemGuideDiskList } from '@/types/apiType/system'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
    setup() {
        const langStore = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const router = useRouter()
        const Translate = langStore.Translate

        // 时区及是否支持夏令时
        const TIME_ZONE = DEFAULT_TIME_ZONE

        // 同步方式与显示文本映射
        const SYNC_TYPE_MAPPING: Record<string, string> = {
            manually: Translate('IDCS_MANUAL'),
            NTP: Translate('IDCS_TIME_SERVER_SYNC'),
        }

        // 日期格式与显示文本映射
        const DATE_FORMAT_MAPPING: Record<string, string> = {
            'year-month-day': Translate('IDCS_DATE_FORMAT_YMD'),
            'month-day-year': Translate('IDCS_DATE_FORMAT_MDY'),
            'day-month-year': Translate('IDCS_DATE_FORMAT_DMY'),
        }

        // 时间格式与显示文本映射
        const TIME_FORMAT_MAPPING: Record<string, string> = {
            '24': Translate('IDCS_TIME_FORMAT_24'),
            '12': Translate('IDCS_TIME_FORMAT_12'),
        }

        // 磁盘名字与显示文本的映射
        const DISK_TYPE_MAPPING: Record<string, string> = {
            hotplug: Translate('IDCS_DISK'),
            esata: Translate('IDCS_ESATA'),
            sata: Translate('IDCS_DISK'),
            sas: Translate('IDCS_SAS'),
            removable: 'UDisk-',
        }

        // 磁盘类型与显示文本的映射
        const TYPE_MAPPING: Record<string, string> = {
            hotplug: Translate('IDCS_NORMAL_DISK'),
            esata: Translate('IDCS_NORMAL_DISK'),
            sata: Translate('IDCS_NORMAL_DISK'),
            sas: Translate('IDCS_NORMAL_DISK'),
            raid: Translate('IDCS_ARRAY'),
            removable: 'UDISK',
        }

        // 显示文本的映射
        const TRANS_MAPPING: Record<string, string> = {
            loadingTip: Translate('IDCS_DEVC_REQUESTING_DATA'),
            bad: Translate('IDCS_NOT_AVAILABLE'),
            local: Translate('IDCS_LOCAL'),
            net: Translate('IDCS_REMOTE'),
            read: Translate('IDCS_READ'),
            'read/write': Translate('IDCS_READ_WRITE'),
            true: Translate('IDCS_ENABLE'),
            false: Translate('IDCS_DISABLE'),
            disk: Translate('IDCS_DISK'),
        }

        // 磁盘状态与显示文本的映射
        const ENCRYPT_STATUS_MAPPING: Record<string, string> = {
            locked: Translate('IDCS_LOCKED'),
            unknown: Translate('IDCS_ENCRYPT_UNKNOWN'),
            encrypted: Translate('IDCS_ENCRYPTED'),
            notEncrypted: Translate('IDCS_NOT_ENCRYPTED'),
        }

        // 从设备获取公钥
        let pubkey = ''

        const pageData = ref({
            // 当前向导页
            current: 'languageAndRegion',
            // 语言选项
            langTypes: {} as Record<string, string>,
            // 地区选项
            regionList: [] as { id: string; code: string; name: string }[],
            // 同步类型选项
            syncTypeOptions: [] as SelectOption<string, string>[],
            // 日期格式选项
            dateFormatOptions: [] as SelectOption<string, string>[],
            // 时间格式选项
            timeFormatOptions: [] as SelectOption<string, string>[],
            // 时间服务器选项
            timeServerOptions: [] as SelectOption<string, string>[],
            // 时区选项
            timeZoneOption: TIME_ZONE,
            // 视频制式选项
            videoTypeOptions: [] as SelectOption<string, string>[],
            // 问题选项（UI2-A）
            questionOptions: [] as SystemGuideQuestionForm[],
            // 最大问题数量
            questionMaxCount: 7,
            // 请求结束的事件，用于时钟的计算
            startTime: 0,
            // 用户手动选择的时间，用于时钟的计算
            systemTime: '',
            // 要求的密码强度
            passwordStrength: 'weak',
            // 密码强度提示
            passwordNoticeMsg: '',
        })

        // 开机向导步骤
        const stepList: Record<string, boolean> = {
            languageAndRegion: true,
            privacy: true,
            dateAndTimezone: true,
            user: true,
            questionAndAnswer: true,
            disk: true,
        }

        const steps = ref<string[]>([])

        const currentStepIndex = computed(() => {
            return steps.value.indexOf(pageData.value.current)
        })

        const langFormData = ref(new SystemGuideLangForm())

        const privacyFormData = ref(new SysmteGuidePrivacyForm())

        const dateTimeFormData = ref(new SystemGuideDateTimeForm())

        const userFormData = ref(new SystemGuideUserForm())

        const qaFormData = ref(new SystemGuideQuestionForm())
        const qaTableData = ref<SystemGuideQuestionForm[]>([])

        // IL03开机向导的密保存在默认的问题，其他UI无此要求
        const isDefeultQuestion = computed(() => {
            return import.meta.env.VITE_UI_TYPE === 'UI2-A'
        })

        /**
         * @description 下一步
         */
        const handleNext = async () => {
            const index = currentStepIndex.value + 1
            if (steps.value.length > index) {
                const current = steps.value[index]
                if (current === 'privacy') {
                    privacyFormData.value.checked = false
                }

                if (current === 'dateAndTimezone') {
                    openLoading()
                    await getTimeConfig()
                    await getDefaultDate()
                    closeLoading()
                }

                if (current === 'user') {
                    clearInterval(interval)
                    openLoading()
                    await getPasswordSecurityStrength()
                    closeLoading()
                }

                if (current === 'questionAndAnswer') {
                    const flag = checkUserForm()
                    if (!flag) {
                        return
                    }

                    if (isDefeultQuestion.value) {
                        qaFormData.value.id = pageData.value.questionOptions[0]?.id || ''
                        qaTableData.value = cloneDeep(pageData.value.questionOptions)
                    } else {
                        qaTableData.value = []
                    }
                    qaFormData.value.answer = ''
                    qaFormData.value.question = ''
                }

                if (current === 'disk') {
                    getDiskData()
                }
                pageData.value.current = current
            } else {
                await formatAllDisk()
                setData()
            }
        }

        /**
         * @description 上一步
         */
        const handlePrev = () => {
            const index = currentStepIndex.value - 1
            const current = steps.value[index]
            if (current === 'privacy') {
                if (index > 0) {
                    pageData.value.current = current
                    handlePrev()
                    return
                } else {
                    privacyFormData.value.checked = false
                }
            }

            if (current === 'dateAndTimezone') {
                clock()
            }

            if (current === 'questionAndAnswer') {
                if (isDefeultQuestion.value) {
                    qaFormData.value.id = pageData.value.questionOptions[0]?.id || ''
                    qaFormData.value.answer = ''
                    qaFormData.value.question = ''
                    qaTableData.value = cloneDeep(pageData.value.questionOptions)
                }
            }
            pageData.value.current = current
        }

        /**
         * @description 激活设备
         */
        const setData = async () => {
            openLoading()
            renderTime()

            const psw = MD5_encrypt(userFormData.value.password)
            const encryptPsw = RSA_encrypt(pubkey, psw) + ''

            let dateTimeXml = ''
            if (steps.value.includes('dateAndTimezone')) {
                dateTimeXml = rawXml`
                    <timeCfg>
                        <timezoneInfo>
                            <timeZone>${dateTimeFormData.value.timeZone}</timeZone>
                            <daylightSwitch>${isDSTDisabled.value ? dateTimeFormData.value.enableDST.toString() : 'false'}</daylightSwitch>
                        </timezoneInfo>
                        <synchronizeInfo>
                            <type>${dateTimeFormData.value.syncType}</type>
                            <ntpServer>${dateTimeFormData.value.timeServer}</ntpServer>
                            <currentTime>${dateTimeFormData.value.systemTime}</currentTime>
                        </synchronizeInfo>
                        <formatInfo>
                            <date>${dateTimeFormData.value.dateFormat}</date>
                            <time>${dateTimeFormData.value.timeFormat}</time>
                        </formatInfo>
                    </timeCfg>
                    <basicCfg>
                        <videoType>${dateTimeFormData.value.videoType}</videoType>
                        <localityCode>${langFormData.value.regionCode}</localityCode>
                        <languageType>${langStore.langId}</languageType>
                    </basicCfg>
                `
            }

            let questionXml = ''
            if (isDefeultQuestion.value) {
                // IL03有默认的密保问题且只保存有答案的密保问题
                questionXml = qaTableData.value
                    .filter((item) => !!item.answer)
                    .map((item) => {
                        return rawXml`
                            <item id="${item.id}">
                                <question>${wrapCDATA(item.question)}</question>
                                <answer>${wrapCDATA(item.answer)}</answer>
                            </item>
                        `
                    })
                    .join('')
            } else {
                questionXml = qaTableData.value
                    .map((item, index) => {
                        return rawXml`
                            <item id="${(index + 1).toString()}">
                                <question>${wrapCDATA(item.question)}</question>
                                <answer>${wrapCDATA(item.answer)}</answer>
                            </item>
                        `
                    })
                    .join('')
            }

            const sendXml = rawXml`
                <content>
                    <authInfo>
                        <password>${encryptPsw}</password>
                    </authInfo>
                    ${dateTimeXml}
                    <questions>${questionXml}</questions>
                </content>
            `
            const result = await activateDev(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_REBOOTING'),
                }).finally(() => {
                    openLoading(LoadingTarget.FullScreen, Translate('IDCS_REBOOTING'))
                })
            } else {
                const errorCode = Number($('//errorCode').text())
                if (errorCode === 536871054) {
                    //设备已初始化完成,跳转登录页面
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_ACTIVATED'),
                    }).finally(() => {
                        router.push('/login')
                    })
                }
            }
        }

        /**
         * @description 获取激活状态
         */
        const getActivationStatus = async () => {
            openLoading()

            const result = await queryActivationStatus()
            const $ = queryXml(result)

            closeLoading()

            // 检查设备是否已经激活
            const activated = $('//content/activated').text().toBoolean()
            if (activated) {
                // 设备已初始化完成,跳转登录页面
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_ACTIVATED'),
                }).finally(() => {
                    router.push('/login')
                })
                return
            }

            pubkey = $('//content/key').text()

            userFormData.value.userName = $('//content/userName').text()

            pageData.value.questionMaxCount = Number($('//content/maxQuestionNum').text()) || 7
            pageData.value.questionOptions = $('//content/question').map((item) => {
                return {
                    id: item.attr('index')!,
                    question: item.text(),
                    answer: '',
                }
            })
            qaFormData.value.id = pageData.value.questionOptions[0]?.id || ''

            stepList.languageAndRegion = !$('//content/showLanguage').length || $('//content/showLanguage').text().toBoolean()
            stepList.privacy = !$('//content/showPrivacyStatement').length || $('//content/showPrivacyStatement').text().toBoolean()
            stepList.dateAndTimezone = !$('//content/showDateTime').length || $('//content/showDateTime').text().toBoolean()

            steps.value = Object.keys(stepList).filter((item) => stepList[item])
        }

        /**
         * @description 更改语言
         * @param {string} key
         */
        const changeLangType = async (key: string) => {
            if (key === langFormData.value.lang) {
                return
            }
            langStore.updateLangId(key)
            const langType = LANG_TYPE_MAPPING[key]
            if (langType) {
                langStore.updateLangType(langType)
            }
            langFormData.value.lang = key
            await langStore.getLangItems(true)
            sortRegionList()
        }

        /**
         * @description 更改地区
         */
        const getRegionList = async () => {
            const result = await queryRegionList()
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.regionList = $('//content/item').map((item) => {
                    return {
                        id: item.attr('id')!,
                        code: item.attr('localityCode')!,
                        name: item.text(),
                    }
                })
                langFormData.value.regionId = $('//content/defaultItem').text()
                langFormData.value.regionCode = pageData.value.regionList.find((item) => item.id === langFormData.value.regionId)!.code
            } else {
                const errorCode = Number($('//errorCode').text())
                if (errorCode === ErrorCode.USER_ERROR_FAIL) {
                    getActivationStatus()
                }
            }
        }

        /**
         * @description 地区排序
         */
        const sortRegionList = () => {
            pageData.value.regionList.sort((a, b) => {
                return Translate(a.name).localeCompare(Translate(b.name))
            })
        }

        const changeRegion = (id: string, code: string) => {
            langFormData.value.regionId = id
            langFormData.value.regionCode = code
        }

        const getDefaultDate = async () => {
            const sendXml = rawXml`
                <condition>
                    <regionId>${langFormData.value.regionId}</regionId>
                </condition>
            `
            const result = await queryDefaultInitData(sendXml)
            const $ = queryXml(result)
            dateTimeFormData.value.timeZone = $('//content/timeCfg/timezoneInfo/timeZone').text()
            dateTimeFormData.value.enableDST = $('//content/timeCfg/timezoneInfo/daylightSwitch').text().toBoolean()
            dateTimeFormData.value.dateFormat = $('//content/timeCfg/formatInfo/data').text()
            dateTimeFormData.value.timeFormat = $('//content/timeCfg/formatInfo/time').text()

            // NVR145-112 优先取initDataNtpServer
            const timeServer = $('//content/timeCfg/synchronizeInfo/ntpServer').text()
            if (timeServer) {
                dateTimeFormData.value.timeServer = timeServer
            }

            const syncType = $('//content/timeCfg/synchronizeInfo/synchronizeInfo').text()
            if (syncType) {
                dateTimeFormData.value.syncType = $('//content/timeCfg/synchronizeInfo/synchronizeInfo').text()
            }

            pageData.value.videoTypeOptions = $('//types/videoType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: item.text(),
                }
            })
            dateTimeFormData.value.videoType = $('//content/basicCfg/videoType').text()
        }

        let interval: NodeJS.Timeout | number = 0

        /**
         * @description 定时更新时间
         */
        const clock = () => {
            renderTime()
            clearInterval(interval)
            interval = setInterval(renderTime, 1000)
        }

        // 禁用夏令时勾选
        const isDSTDisabled = computed(() => {
            const findItem = TIME_ZONE.find((item) => dateTimeFormData.value.timeZone === item.timeZone)
            if (findItem) return !findItem.enableDst
            return true
        })

        /**
         * @description 获取日期时间配置
         */
        const getTimeConfig = async () => {
            const result = await queryTimeCfg(false)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                pageData.value.syncTypeOptions = $('//types/synchronizeType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: SYNC_TYPE_MAPPING[item.text()],
                    }
                })

                dateTimeFormData.value.dateFormat = $('//content/formatInfo/date').text()
                pageData.value.dateFormatOptions = $('//types/dateFormat/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: DATE_FORMAT_MAPPING[item.text()],
                    }
                })

                dateTimeFormData.value.timeFormat = $('//content/formatInfo/time').text()
                pageData.value.timeFormatOptions = $('//types/timeFormat/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: TIME_FORMAT_MAPPING[item.text()],
                    }
                })

                dateTimeFormData.value.syncType = $('//content/synchronizeInfo/type').text()

                dateTimeFormData.value.timeServer = $('//content/synchronizeInfo/ntpServer').text().trim()
                pageData.value.timeServerOptions = $('//types/ntpServerType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: item.text(),
                    }
                })

                dateTimeFormData.value.timeZone = $('//content/timezoneInfo/timeZone').text()
                dateTimeFormData.value.enableDST = $('//content/timezoneInfo/daylightSwitch').text().toBoolean()

                nextTick(() => {
                    dateTimeFormData.value.systemTime = dayjs(Date.now()).format(formatSystemTime.value)
                    pageData.value.systemTime = dateTimeFormData.value.systemTime
                    pageData.value.startTime = performance.now()
                    clock()
                })
            } else {
                const errorCode = Number($('//errorCode').text())
                if (errorCode === ErrorCode.USER_ERROR_FAIL) {
                    getActivationStatus()
                }
            }
        }

        // 显示时间格式
        const formatSystemTime = computed(() => {
            return DEFAULT_MOMENT_MAPPING[dateTimeFormData.value.dateFormat] + ' ' + DEFAULT_MOMENT_MAPPING[dateTimeFormData.value.timeFormat]
        })

        watch(formatSystemTime, (newFormat, oldFormat) => {
            dateTimeFormData.value.systemTime = dayjs(dateTimeFormData.value.systemTime, oldFormat).format(newFormat)
            pageData.value.systemTime = dayjs(pageData.value.systemTime, oldFormat).format(newFormat)
        })

        /**
         * @description 定时更新时间
         */
        const renderTime = () => {
            const now = performance.now()
            dateTimeFormData.value.systemTime = dayjs(pageData.value.systemTime, formatSystemTime.value)
                .add(now - pageData.value.startTime, 'millisecond')
                .format(formatSystemTime.value)
        }

        /**
         * @description 更改系统时间和定时器
         */
        const handleSystemTimeChange = () => {
            pageData.value.systemTime = dateTimeFormData.value.systemTime
            pageData.value.startTime = performance.now()
        }

        /**
         * @description 更改系统时间时，停止定时器
         * @param {boolean} bool
         */
        const pendingSystemTimeChange = (bool: boolean) => {
            if (bool) {
                clearInterval(interval)
            } else {
                clock()
            }
        }

        /**
         * @description 时区文本显示
         * @param {number} index
         * @returns {string}
         */
        const displayTimeZone = (index: number) => {
            return Translate('IDCS_TIME_ZONE_' + (index + 1))
        }

        /**
         * @description 密码强度提示
         */
        const getPasswordNoticeMsg = () => {
            switch (pageData.value.passwordStrength) {
                case 'medium':
                    pageData.value.passwordNoticeMsg = Translate('IDCS_PASSWORD_STRONG_MIDDLE').formatForLang(8, 16)
                    break
                case 'strong':
                    pageData.value.passwordNoticeMsg = Translate('IDCS_PASSWORD_STRONG_HEIGHT').formatForLang(8, 16)
                    break
                case 'stronger':
                    pageData.value.passwordNoticeMsg = Translate('IDCS_PASSWORD_STRONG_HEIGHEST').formatForLang(8, 16)
                    break
                default:
                    break
            }
        }

        /**
         * @description 获取密码强度要求
         */
        const getPasswordSecurityStrength = async () => {
            const result = await queryPasswordSecurity(false)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.passwordStrength = ($('//content/pwdSecureSetting/pwdSecLevel').text() as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING & null) ?? 'weak'
                getPasswordNoticeMsg()
            } else {
                const errorCode = Number($('//errorCode').text())
                if (errorCode === ErrorCode.USER_ERROR_FAIL) {
                    getActivationStatus()
                }
            }
        }

        // 当前密码强度
        const passwordStrength = computed(() => getPwdSaftyStrength(userFormData.value.password))

        /**
         * @description 校验用户表单
         */
        const checkUserForm = () => {
            if (!userFormData.value.password.length) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_PASSWORD_EMPTY'),
                })
                return false
            }

            if (userFormData.value.password !== userFormData.value.confirmPassword) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PWD_MISMATCH_TIPS'),
                })
                return false
            }

            if (DEFAULT_PASSWORD_STREMGTH_MAPPING[pageData.value.passwordStrength] > passwordStrength.value) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PWD_STRONG_ERROR'),
                })
                return false
            }
            return true
        }

        /**
         * @description 更改问题
         */
        const changeQuestion = () => {
            if (isDefeultQuestion.value) {
                qaFormData.value.answer = ''
            }
        }

        /**
         * @description 添加问题答案
         */
        const addQuestion = () => {
            if (isDefeultQuestion.value) {
                if (!qaFormData.value.answer.trim()) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_ANSWER_EMPTY'),
                    })
                    return
                }
                const index = qaTableData.value.findIndex((item) => item.id === qaFormData.value.id)
                if (index > -1) {
                    qaTableData.value[index].answer = qaFormData.value.answer
                }
            } else {
                if (!qaFormData.value.question.trim()) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_QUESTION_EMPTY'),
                    })
                    return
                }

                if (!qaFormData.value.answer.trim()) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_ANSWER_EMPTY'),
                    })
                    return
                }

                if (qaTableData.value.length >= pageData.value.questionMaxCount) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_MAX_QUESTION'),
                    })
                    return
                }

                const sameQuestion = qaTableData.value.some((item) => item.question === qaFormData.value.question.trim())
                if (sameQuestion) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_QUESTION_IS_EXIST'),
                    })
                }

                qaTableData.value.push({
                    id: '0',
                    question: qaFormData.value.question.trim(),
                    answer: qaFormData.value.answer.trim(),
                })
                qaFormData.value.question = ''
                qaFormData.value.answer = ''
            }
        }

        /**
         * @description 删除问题与答案
         * @param {number} index
         */
        const deleteQuestion = (index: number) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                if (isDefeultQuestion.value) {
                    qaTableData.value[index].answer = ''
                } else {
                    qaTableData.value.splice(index, 1)
                }
            })
        }

        const diskTableData = ref<SystemGuideDiskList[]>([])

        /**
         * @description 获取磁盘信息
         */
        const getDiskData = async () => {
            const storage = await queryStorageDevInfo(false)
            const $storage = queryXml(queryXml(storage)('//content')[0].element)

            const errorCode = Number($storage('//errorCode').text())
            if (errorCode === ErrorCode.USER_ERROR_FAIL) {
                getActivationStatus()
                return
            }

            const result = await queryDiskStatus(false)
            const $ = queryXml(result)
            $storage('//content/diskList/item').map((item) => {
                const $item = queryXml(item.element)

                const diskId = item.attr('id')!
                const diskStatus = $(`//content/item[@id="${diskId}"]/diskStatus`).text()
                const diskEncryptStatus = $(`//content/item[@id="${diskId}"]/diskEncryptStatus`).text()
                const diskInterfaceType = $item('diskInterfaceType').text()

                let combinedStatus = ''
                switch (diskEncryptStatus) {
                    case 'locked':
                        combinedStatus = ENCRYPT_STATUS_MAPPING[diskEncryptStatus]
                        break
                    case 'unknown':
                        combinedStatus = TRANS_MAPPING[diskStatus]
                        break
                    default:
                        combinedStatus = `${TRANS_MAPPING[diskStatus]}(${ENCRYPT_STATUS_MAPPING[diskEncryptStatus]})`
                        break
                }

                const isUDisk = diskInterfaceType === 'removable'

                // U盘不显示
                if (!isUDisk) {
                    diskTableData.value.push({
                        id: diskId,
                        name: DISK_TYPE_MAPPING[diskInterfaceType] + $item('slotIndex').text(),
                        type: TYPE_MAPPING[diskInterfaceType] || '',
                        size: Math.floor(Number($item('size').text()) / 1024),
                        combinedStatus,
                        diskStatus,
                        serialNum: $item('serialNum').text(),
                    })
                }
            })
        }

        /**
         * @description 格式化磁盘
         * @param {number} index
         */
        const formatCurrentDisk = (index: number) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_FORMAT_MP_DISK_RESULT'),
            }).then(async () => {
                openLoading()

                const sendXml = rawXml`
                    <condition>
                        <diskIds>
                            <item id="${diskTableData.value[index].id}"></item>
                        </diskIds>
                    </condition>
                `
                await formatDisk(sendXml, false)
                diskTableData.value[index].diskStatus = 'hasFormat'

                closeLoading()
            })
        }

        /**
         * @description 格式化所有磁盘
         */
        const formatAllDisk = () => {
            return new Promise((resolve: (value: undefined) => void) => {
                const needFormatDisk = diskTableData.value.filter((item) => item.diskStatus === 'bad')
                if (needFormatDisk.length > 0) {
                    openMessageBox({
                        type: 'question',
                        message: '<span>' + Translate('IDCS_QUESTION_FORMAT_DISK') + '</span></br><span style="color: red">' + Translate('IDCS_FORMAT_MP_DISK_RESULT') + '</span>',
                    })
                        .then(async () => {
                            openLoading()
                            const sendXml = rawXml`
                                <condition>
                                    <diskIds>
                                        ${needFormatDisk.map((item) => `<item id="${item.id}"></item>`).join('')}
                                    </diskIds>
                                </condition>
                            `
                            await formatDisk(sendXml, false)
                            closeLoading()
                            resolve(void 0)
                        })
                        .catch(() => {
                            resolve(void 0)
                        })
                } else {
                    resolve(void 0)
                }
            })
        }

        onMounted(async () => {
            await getActivationStatus()
            const langTypes = await langStore.getLangTypes()
            langFormData.value.lang = langStore.langId
            pageData.value.langTypes = unref(langTypes)
            await getRegionList()
            sortRegionList()
            nextTick(() => {
                document.querySelector('.lang-list li.active')?.scrollIntoView({
                    block: 'center',
                })
                document.querySelector('.region-list li.active')?.scrollIntoView({
                    block: 'center',
                })
            })
            pageData.value.current = steps.value[0]
        })

        onBeforeUnmount(() => {
            clearInterval(interval)
        })

        return {
            pageData,
            langFormData,
            privacyFormData,
            dateTimeFormData,
            userFormData,
            qaFormData,
            qaTableData,
            diskTableData,
            changeLangType,
            changeRegion,
            isDSTDisabled,
            displayTimeZone,
            handleSystemTimeChange,
            pendingSystemTimeChange,
            formatSystemTime,
            handleNext,
            handlePrev,
            steps,
            passwordStrength,
            isDefeultQuestion,
            addQuestion,
            changeQuestion,
            deleteQuestion,
            formatCurrentDisk,
        }
    },
})
