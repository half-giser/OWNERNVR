<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:07:36
 * @Description: 端口
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 18:10:13
-->
<template>
    <div class="Port">
        <!-- 端口 -->
        <el-form
            ref="portFormRef"
            class="form port"
            :model="portFormData"
            :rule="portFormRule"
            inline-message
            label-position="left"
        >
            <div class="title">{{ Translate('IDCS_PORT') }}</div>
            <el-form-item
                :label="Translate('IDCS_HTTP_PORT')"
                prop="httpPort"
            >
                <el-input-number
                    v-model="portFormData.httpPort"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_HTTPS_PORT')"
                prop="httpsPort"
            >
                <el-input-number
                    v-model="portFormData.httpsPort"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SERVE_PORT')"
                prop="netPort"
            >
                <el-input-number
                    v-model="portFormData.netPort"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item
                v-show="pageData.isPosPort"
                :label="Translate('IDCS_POS_PORT')"
                prop="posPort"
            >
                <el-input-number
                    v-model="portFormData.posPort"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <el-form-item v-show="pageData.isVirtualPortEnabled">
                <el-checkbox>{{ Translate('IDCS_VIRTUAL_HOST') }}</el-checkbox>
            </el-form-item>
        </el-form>
        <!-- API SERVER -->
        <el-form
            v-show="!pageData.isUse44"
            class="form api-server"
            inline-message
            label-position="left"
        >
            <div class="title">{{ Translate('IDCS_API_SERVER') }}</div>
            <el-form-item>
                <el-checkbox
                    v-model="apiServerFormData.apiserverSwitch"
                    @change="changeApiServerSwitch"
                    >{{ Translate('IDCS_API_SERVER') }}</el-checkbox
                >
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ENCRYPTION_TYPE')">
                <el-select
                    v-model="apiServerFormData.authenticationType"
                    :disabled="!apiServerFormData.apiserverSwitch"
                >
                    <el-option
                        v-for="item in pageData.apiVerificationOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <!-- RTSP -->
        <el-form
            class="form rtsp"
            inline-message
            label-position="left"
        >
            <div
                v-show="!pageData.isUse44"
                class="title"
            >
                {{ Translate('IDCS_RTSP') }}
            </div>
            <el-form-item v-show="!pageData.isUse44">
                <el-checkbox
                    v-model="rtspServerFormData.rtspServerSwitch"
                    @change="changeRtspServerSwitch"
                    >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                >
            </el-form-item>
            <el-form-item
                v-show="!pageData.isUse44"
                :label="Translate('IDCS_ENCRYPTION_TYPE')"
            >
                <el-select
                    v-model="rtspServerFormData.rtspAuthType"
                    :disabled="!rtspServerFormData.rtspServerSwitch"
                >
                    <el-option
                        v-for="item in pageData.rtspAuthenticationOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                prop="rtspPort"
                :label="Translate('IDCS_RTSP_PORT')"
            >
                <el-input-number
                    v-model="rtspServerFormData.rtspPort"
                    :disabled="!rtspServerFormData.rtspServerSwitch"
                    :min="10"
                    :max="65535"
                />
                <el-checkbox
                    v-model="rtspServerFormData.anonymousAccess"
                    :disabled="!rtspServerFormData.rtspServerSwitch"
                    @change="changeAnonymous"
                    >{{ Translate('IDCS_RTSP_ANONYMOUS_ACCESS') }}</el-checkbox
                >
            </el-form-item>
        </el-form>
        <div class="btns">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts">
import { NetPortForm, NetPortUPnPDto, NetPortApiServerForm, NetPortRtspServerForm } from '@/types/apiType/net'
import { type FormInstance, type FormRules } from 'element-plus'
import { APP_TYPE } from '@/utils/constants'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const systemCaps = useCababilityStore()

        const VERIFICATION_MAPPING: Record<string, string> = {
            Basic: Translate('IDCS_BASE64'),
            Digest: Translate('IDCS_MD5'),
        }

        const portFormRef = ref<FormInstance>()
        const portFormData = ref(new NetPortForm())
        const portFormRule = ref<FormRules>({
            httpPort: [
                {
                    validator(rules, value, callback) {
                        const error = validatePort('httpPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            httpsPort: [
                {
                    validator(rules, value, callback) {
                        const error = validatePort('httpsPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            netPort: [
                {
                    validator(rules, value, callback) {
                        const error = validatePort('netPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            posPort: [
                {
                    validator(rules, value, callback) {
                        const error = validatePort('posPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const apiServerFormData = ref(new NetPortApiServerForm())

        const rtspServerFormRef = ref<FormInstance>()
        const rtspServerFormData = ref(new NetPortRtspServerForm())
        const rtspServerFormRule = ref<FormRules>({
            rtspPort: [
                {
                    validator(rules, value, callback) {
                        const error = validatePort('rtspPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const pageData = ref({
            // UI1-E客户定制，页面不显示apiserver
            isUse44: getUiAndTheme().name === 'UI1-E',
            // 系统保留端口
            reservedPort: [] as number[],
            upnp: new NetPortUPnPDto(),
            //poe switch功能保留端口范围
            reservedPortRange: [] as [number, number][],
            wirelessSwitch: false,
            isPosPort: true,
            isVirtualPortEnabled: true,
            isPortFormChanged: false,
            isApiServerFormChanged: false,
            isRtspServerFormChanged: false,
            mounted: false,
            apiVerificationOptions: [] as SelectOption<string, string>[],
            rtspAuthenticationOptions: [] as SelectOption<string, string>[],
        })

        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)

            await getPortData()
            await getWirelessNetworkData()
            await getUPnPData()
            await getApiServerData()
            await getRtspServerData()

            closeLoading(LoadingTarget.FullScreen)

            nextTick(() => {
                pageData.value.mounted = true
            })
        }

        const setData = async () => {
            // portFormRef.value?.validate(valid)
            // if () {
            // }
            openLoading(LoadingTarget.FullScreen)

            const res1 = await setPortData()
            const res2 = await setApiServerData()
            const res3 = await setRtspServerData()
            const res4 = await setUPnPData()

            closeLoading(LoadingTarget.FullScreen)

            if (res1 && res2 && res3 && res4) {
                openMessageTipBox({
                    type: 'success',
                    title: Translate('IDCS_SUCCESS_TIP'),
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }

            pageData.value.mounted = false
            pageData.value.isPortFormChanged = false
            pageData.value.isApiServerFormChanged = false
            pageData.value.isRtspServerFormChanged = false

            getData()
        }

        const getPortData = async () => {
            const result = await queryNetPortCfg()
            commLoadResponseHandler(result, ($) => {
                portFormData.value.httpPort = Number($('/response/content/httpPort').text())
                portFormData.value.httpsPort = Number($('/response/content/httpsPort').text())
                portFormData.value.netPort = Number($('/response/content/netPort').text())
                portFormData.value.posPort = Number($('/response/content/posPort').text())
                // portFormData.value.rtspPort = Number($("/response/content/rtspPort").text())
                portFormData.value.virtualHostEnabled = $('/response/content/virtualHostEnabled').text().toBoolean()

                const reservedPort = $('/response/content/reservedPort').text().split(',')
                pageData.value.reservedPort = []
                pageData.value.reservedPortRange = []
                reservedPort.forEach((item) => {
                    const regNum = /^\d+$/
                    const regRange = /^\d+-\d+$/
                    if (regNum.test(item)) {
                        pageData.value.reservedPort.push(Number(item))
                    }
                    if (regRange.test(item)) {
                        const temp = item.split('-')
                        pageData.value.reservedPortRange.push([Number(temp[0]), Number(temp[1])])
                    }
                })
            })
        }

        const PORT_ERROR_MAPPING: [string, string, string][] = [
            ['httpPort', 'dataPort', 'IDCS_PROMPT_HTTP_DATA_THE_SAME_PORT'],
            ['httpPort', 'rtspPort', 'IDCS_PROMPT_HTTP_RTSP_THE_SAME_PORT'],
            ['dataPort', 'rtspPort', 'IDCS_PROMPT_DATA_RTSP_THE_SAME_PORT'],
            ['httpPort', 'posPort', 'IDCS_POS_DATA_HTTP_THE_SAME_PORT'],
            ['httpsPort', 'posPort', 'IDCS_POS_DATA_HTTPS_THE_SAME_PORT'],
            ['dataPort', 'posPort', 'IDCS_POS_DATA_PROMPT_THE_SAME_PORT'],
            ['rtspPort', 'posPort', 'IDCS_POS_DATA_RTSP_THE_SAME_PORT'],
            ['httpPort', 'httpsPort', 'IDCS_PROMPT_HTTPS_HTTP_THE_SAME_PORT'],
            ['httpsPort', 'dataPort', 'IDCS_PROMPT_HTTPS_DATA_THE_SAME_PORT'],
            ['httpsPort', 'rtspPort', 'IDCS_PROMPT_HTTPS_RTSP_THE_SAME_PORT'],
        ]

        const validatePort = (param: string, value: number) => {
            const portValue: [string, number][] = [
                ['httpPort', portFormData.value.httpPort],
                ['httpsPort', portFormData.value.httpsPort],
                ['netPort', portFormData.value.netPort],
                ['rtspPort', rtspServerFormData.value.rtspPort],
                ['posPort', portFormData.value.posPort],
            ]
            const findSamePort = portValue.find((port) => port[1] === value && port[0] !== param)
            if (findSamePort) {
                const errorText = PORT_ERROR_MAPPING.find((item) => {
                    return (item[0] === findSamePort[0] && item[1] === param) || (item[0] === param && item[1] === findSamePort[0])
                })
                if (errorText) {
                    return Translate(errorText[2])
                }
            }
            const isReservedPort = pageData.value.reservedPort.includes(value)
            if (isReservedPort) {
                return Translate('IDCS_SYSTEM_RESERVED_PORT').formatForLang(value)
            }
            const isReservedPortRange = pageData.value.reservedPortRange.some((item) => value >= item[0] && value <= item[1])
            if (isReservedPortRange) {
                return Translate('IDCS_SYSTEM_RESERVED_PORT').formatForLang(value)
            }
            return ''
        }

        const setPortData = async () => {
            if (!pageData.value.isPortFormChanged) {
                return true
            }
            const sendXml = rawXml`
                <content>
                    <httpPort>${String(portFormData.value.httpPort)}</httpPort>
                    <httpsPort>${String(portFormData.value.httpsPort)}</httpsPort>
                    <netPort>${String(portFormData.value.netPort)}</netPort>
                    <posPort>${String(portFormData.value.posPort)}</posPort>
                    <virtualHostEnabled>${String(portFormData.value.virtualHostEnabled)}</virtualHostEnabled>
                </content>
            `
            const result = await editNetPortCfg(sendXml)
            const $ = queryXml(result)

            return $('/response/status').text() === 'success'
        }

        const getWirelessNetworkData = async () => {
            if (APP_TYPE === 'P2P') {
                const result = await queryWirelessNetworkCfg()
                const $ = queryXml(result)
                pageData.value.wirelessSwitch = $('/response/content/switch').text().toBoolean()
            }
        }

        const getUPnPData = async () => {
            const result = await queryUPnPCfg()
            const $ = queryXml(result)
            pageData.value.upnp = {
                switch: $('/response/content/switch').text(),
                mappingType: $('/response/content/mappingType').text(),
                portsType: $('/response/content/ports').attr('type')!,
                ports: $('/response/content/ports/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        portType: $item('portType').text(),
                        externalPort: $item('externalPort').text(),
                        externalIP: $item('externalIP').text(),
                        localPort: $item('localPort').text(),
                        status: $item('status').text(),
                    }
                }),
            }
        }

        const setUPnPData = async () => {
            if (!pageData.value.isPortFormChanged && !pageData.value.isApiServerFormChanged && !pageData.value.isRtspServerFormChanged) {
                return true
            }
            const portTypeMapping: Record<string, number> = {
                HTTP: portFormData.value.httpPort,
                HTTPS: portFormData.value.httpsPort,
                RTSP: rtspServerFormData.value.rtspPort,
                SERVICE: portFormData.value.netPort,
                POS: portFormData.value.posPort,
            }
            const portsItem = pageData.value.upnp.ports
                .map((item) => {
                    const externalPort = pageData.value.upnp.mappingType === 'auto' ? String(portTypeMapping[item.portType]) : item.externalPort
                    return rawXml`
                    <item>
                        <portType>${item.portType}</portType>
                        <externalPort>${externalPort}</externalPort>
                        ${item.externalIP ? `<externalIP>${item.externalIP}</externalIP>` : ''}
                        <localPort>${item.localPort}</localPort>
                        <status>${item.status}</status>
                    </item>
                `
                })
                .join('')
            const sendXml = rawXml`
                <types>
                    <mappingType>
                        <enum>auto</enum>
                        <enum>manually</enum>
                    </mappingType>
                    <portType>
                        <enum>HTTP</enum>
                        <enum>HTTPS</enum>
                        <enum>RTSP</enum>
                        <enum>SERVICE</enum>
                        <enum>POS</enum>
                    </portType>
                    <statusType>
                        <enum>effective</enum>
                        <enum>ineffective</enum>
                    </statusType>
                </types>
                <content>
                    <switch>${pageData.value.upnp.switch}</switch>
                    <mappingType type='mappingType'>${pageData.value.upnp.mappingType}</mappingType>
                    <ports type='list'>
                        <itemType>
                            <portType type='portType'/>
                            <status type='statusType'/>
                        </itemType>
                        ${portsItem}
                    </ports>
                </content>
            `
            const result = await editUPnPCfg(sendXml)
            const $ = queryXml(result)

            return $('/response/status').text() === 'success'
        }

        const getApiServerData = async () => {
            const result = await queryApiServer()
            const $ = queryXml(result)

            if ($('/response/status').text() === 'success') {
                pageData.value.apiVerificationOptions = $('/response/types/authenticationType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: VERIFICATION_MAPPING[item.text()],
                    }
                })
                apiServerFormData.value.apiserverSwitch = $('/response/content/apiserverSwitch').text().toBoolean()
                apiServerFormData.value.authenticationType = $('/response/content/authenticationType').text()
            }
        }

        const setApiServerData = async () => {
            if (!pageData.value.isApiServerFormChanged) {
                return true
            }

            const sendXml = rawXml`
                <content>
                    <apiserverSwitch>${String(apiServerFormData.value.apiserverSwitch)}</apiserverSwitch>
                    <authenticationType>${apiServerFormData.value.authenticationType}</authenticationType>
                </content>
            `
            const result = await editApiServer(sendXml)
            const $ = queryXml(result)

            return $('/response/status').text() === 'success'
        }

        const changeApiServerSwitch = () => {
            if (apiServerFormData.value.apiserverSwitch && !rtspServerFormData.value.rtspServerSwitch) {
                openMessageTipBox({
                    type: 'question',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_ENABLE_API_AFTER_RTSP_TIP'),
                }).then(() => {
                    rtspServerFormData.value.rtspServerSwitch = true
                })
            }
        }

        const getRtspServerData = async () => {
            const result = await queryRTSPServer()
            const $ = queryXml(result)

            if ($('/response/status').text() === 'success') {
                pageData.value.rtspAuthenticationOptions = $('/response/types/authenticationType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: VERIFICATION_MAPPING[item.text()],
                    }
                })
                rtspServerFormData.value.rtspServerSwitch = $('/response/content/rtspServerSwitch').text().toBoolean()
                rtspServerFormData.value.rtspAuthType = $('/response/content/rtspAuthType').text()
                rtspServerFormData.value.rtspPort = Number($('/response/content/rtspPort').text())
                rtspServerFormData.value.anonymousAccess = $('/response/content/anonymousAccess').text().toBoolean()
            }
        }

        const setRtspServerData = async () => {
            if (!pageData.value.isRtspServerFormChanged) {
                return true
            }

            const sendXml = rawXml`
                <content>
                    <rtspServerSwitch>${String(rtspServerFormData.value.rtspServerSwitch)}</rtspServerSwitch>
                    <rtspAuthType>${rtspServerFormData.value.rtspAuthType}</rtspAuthType>
                    <rtspPort>${String(rtspServerFormData.value.rtspPort)}</rtspPort>
                    <anonymousAccess>${String(rtspServerFormData.value.anonymousAccess)}</anonymousAccess>
                </content>
            `
            const result = await editRTSPServer(sendXml)
            const $ = queryXml(result)

            return $('/response/status').text() === 'success'
        }

        const changeRtspServerSwitch = () => {
            if (rtspServerFormData.value.rtspServerSwitch) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_RTSP_OR_FTP_ENABLE_REMIND'),
                })
            }
        }

        const changeAnonymous = () => {
            if (rtspServerFormData.value.anonymousAccess) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_ANONYMOUS_LOGIN_REMIND'),
                })
            }
        }

        watch(
            portFormData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.isPortFormChanged = true
                }
            },
            {
                deep: true,
            },
        )

        watch(
            apiServerFormData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.isApiServerFormChanged = true
                }
            },
            {
                deep: true,
            },
        )

        watch(
            rtspServerFormData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.isRtspServerFormChanged = true
                }
            },
            {
                deep: true,
            },
        )

        onMounted(async () => {
            await systemCaps.updateCabability()
            pageData.value.isPosPort = systemCaps.supportPOS
            pageData.value.isVirtualPortEnabled = systemCaps.poeChlMaxCount > 0
            getData()
        })

        return {
            portFormData,
            portFormRef,
            portFormRule,
            pageData,
            apiServerFormData,
            rtspServerFormData,
            rtspServerFormRef,
            rtspServerFormRule,
            setData,
            changeApiServerSwitch,
            changeAnonymous,
            changeRtspServerSwitch,
        }
    },
})
</script>

<style lang="scss" scoped>
.Port {
    .form {
        :deep(.el-form-item__label) {
            width: 150px;
        }

        & > * {
            margin-bottom: 0;
            padding: 10px 0 10px 15px;

            // &:nth-child(even) {
            //     background-color: var(--bg-color5);
            // }
        }

        :deep(.el-form-item__content) {
            flex-wrap: nowrap;
        }

        .el-select,
        .el-input,
        .el-input-number {
            width: 200px;
            flex-shrink: 0;
            margin-right: 10px;
        }
    }

    .title {
        width: 100%;
        height: 35px;
        font-weight: bold;
        padding: 0 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 35px;
        background-color: var(--bg-color4);
        box-sizing: border-box;
        flex-shrink: 0;
    }

    .btns {
        width: 100%;
        display: flex;
        justify-content: center;
    }
}
</style>
