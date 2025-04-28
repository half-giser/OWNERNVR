/*
 * @Date: 2025-04-27 20:04:28
 * @Description: 诊断数据
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            periodOptions: arrayToOptions([1, 3, 5, 7, 15]),
            isCheckAuthPop: false,
            isShowPassword: false,
            debugModeSwitch: false,
            isEncryptPwdPop: false,
            exportOptions: [
                {
                    label: Translate('IDCS_ESSENTIAL_DEBUG_DATA'),
                    value: 'base',
                },
                {
                    label: Translate('IDCS_OPTIONAL_DEBUG_DATA'),
                    value: 'advanced',
                },
            ],
        })

        const formData = ref({
            debugModeSwitch: false,
            timeLen: 1,
            userName: '',
            password: '',
            startTime: 0,
            endTime: 0,
        })

        const exportFormData = ref({
            infoLeve: 'base',
            filter: '',
        })

        const setData = () => {
            pageData.value.isCheckAuthPop = true
        }

        const confirmSetData = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <debugModeSwitch>${formData.value.debugModeSwitch}</debugModeSwitch>
                    <timeLen unit="hour">${formData.value.timeLen * 24}</timeLen>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editDebugMode(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
                pageData.value.isCheckAuthPop = false
                pageData.value.isShowPassword = false
                getData()
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case 536870948:
                    case 536870947:
                        openMessageBox(Translate('IDCS_DEVICE_PWD_ERROR'))
                        break
                    case 536870953:
                        openMessageBox(Translate('IDCS_NO_AUTH'))
                        break
                    default:
                        openMessageBox('IDCS_SAVE_DATA_FAIL')
                        break
                }
            }
        }

        const getData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <debugModeSwitch>${formData.value.debugModeSwitch}</debugModeSwitch>
                </content>
            `
            const result = await queryDebugMode(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value.debugModeSwitch = $('content/debugModeSwitch').text() === 'on'
                formData.value.startTime = $('content/debugModeSwitch').attr('startTime').num() * 1000
                formData.value.endTime = $('content/debugModeSwitch').attr('endTime').num() * 1000
                formData.value.userName = $('content/DevUserInfo/userName').text()
                formData.value.timeLen = calculateTimeLen()
                const password = $('content/DevUserInfo/userPsd').text()
                // 安全版本, 1: AES加密(本地web), 非1: base64编码(P2P, APP远程配置)
                const securityVer = $('content/DevUserInfo/userPsd').attr('securityVer')
                if (securityVer === '1') {
                    formData.value.password = AES_decrypt(password, userSession.sesionKey)
                } else {
                    formData.value.password = base64Decode(password)
                }
                pageData.value.debugModeSwitch = formData.value.debugModeSwitch
            }
        }

        const calculateTimeLen = () => {
            return (formData.value.endTime - formData.value.startTime) / 1000 / 3600 / 24
        }

        const displayTime = computed(() => {
            return formatDate(formData.value.endTime, dateTime.dateTimeFormat)
        })

        const isAdmin = computed(() => {
            return userSession.userType === USER_TYPE_DEFAULT_ADMIN
        })

        const exportData = () => {
            pageData.value.isEncryptPwdPop = true
        }

        const confirmExportData = async (e: UserInputEncryptPwdForm) => {
            pageData.value.isEncryptPwdPop = false

            openLoading()

            try {
                const sendXml = rawXml`
                    <content>
                        <infoLeve>${exportFormData.value.infoLeve}</infoLeve>
                        <packPsd ${getSecurityVer()}>${e.password}</packPsd>
                        ${exportFormData.value.infoLeve === 'advanced' ? `<filter>${wrapCDATA(base64Encode(exportFormData.value.filter))}</filter>` : ''}
                    </content>
                `
                const result = await getDebugInfo(sendXml)
                const $ = queryXml(result)

                closeLoading()

                if ($('status').text() === 'success') {
                    const debugInfo = $('content/debugInfo').text()
                    const dataBlob = dataURLToBlob(debugInfo)
                    download(dataBlob, `${Translate('IDCS_DEBUG_DATA')}_${formatDate(new Date(), 'YYYYMMDDHHmmss')}`)
                } else {
                    openMessageBox(Translate('IDCS_EXPORT_FAIL'))
                }
            } catch {
                openMessageBox(Translate('IDCS_EXPORT_FAIL'))
            }
        }

        /**
         * @description 上传筛选条件
         * @param {Event} e
         */
        const changeFile = (e: Event) => {
            const files = (e.target as HTMLInputElement).files

            if (files && files.length) {
                const file = files[0]
                const fileType = file.name.split('.').pop()!.toLowerCase()

                if (fileType === 'txt') {
                    const reader = new FileReader()
                    reader.readAsText(file)
                    reader.onloadend = () => {
                        if (!reader.result) {
                            clearImportFile()
                            openMessageBox(Translate('IDCS_FILE_INVALID'))
                            return
                        }

                        exportFormData.value.filter = reader.result as string
                        clearImportFile()
                    }
                } else {
                    clearImportFile()
                    openMessageBox('IDCS_FILE_NOT_AVAILABLE')
                }
            }
        }

        const clearImportFile = () => {
            ;(document.getElementById('h5BrowerImport') as HTMLInputElement).value = ''
        }

        const clearFilter = () => {
            exportFormData.value.filter = ''
        }

        const toggleMask = () => {
            pageData.value.isShowPassword = !pageData.value.isShowPassword
        }

        onMounted(() => {
            getData()
        })

        return {
            pageData,
            formData,
            setData,
            confirmSetData,
            isAdmin,
            displayTime,
            exportData,
            confirmExportData,
            exportFormData,
            clearFilter,
            toggleMask,
            changeFile,
        }
    },
})
