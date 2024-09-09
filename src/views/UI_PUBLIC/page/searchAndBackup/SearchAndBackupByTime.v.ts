/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 13:48:10
 * @Description: 按时间搜索
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-04 18:02:38
 */
import dayjs from 'dayjs'
import { type PlaybackChlList } from '@/types/apiType/playback'
import { type PlaybackBackUpRecList } from '@/types/apiType/playback'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'

export default defineComponent({
    components: {
        BackupPop,
        BackupLocalPop,
    },
    setup() {
        const Plugin = inject('Plugin') as PluginType
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const pluginStore = usePluginStore()
        const router = useRouter()
        const systemCaps = useCababilityStore()

        const mode = computed(() => {
            return Plugin.IsSupportH5() ? 'h5' : 'ocx'
        })

        const EVENTS = ['MANUAL', 'SENSOR', 'MOTION', 'SCHEDULE']
        if (systemCaps.ipChlMaxCount) {
            EVENTS.push('INTELLIGENT')
        }
        if (systemCaps.supportPOS) {
            EVENTS.push('POS')
        }

        // 通道ID与通道名称的映射
        const chlMap = ref<Record<string, string>>({})

        const dateTime = useDateTimeStore()
        const userAuth = useUserChlAuth()

        const pageData = ref({
            // 通道列表
            chlList: [] as PlaybackChlList[],
            // 是否打开本地备份弹窗（H5）
            isLocalBackUpPop: false,
            // 是否打开备份弹窗
            isBackUpPop: false,
            // 录像备份列表
            backupRecList: [] as PlaybackBackUpRecList[],
            // 最大通道数
            maxChl: 36,
        })

        const formData = ref({
            // 开始时间
            startTime: '',
            // 结束事件
            endTime: '',
            // 选中的通道列表
            chls: [] as string[],
        })

        // 支持的最大通道数
        const maxChl = computed(() => {
            return Math.min(pageData.value.chlList.length, pageData.value.maxChl)
        })

        // 通道全选
        const isChlAll = computed(() => {
            return formData.value.chls.length >= maxChl.value
        })

        /**
         * @description 获取通道列表
         */
        const getChlsList = async () => {
            const result = await queryChlsExistRec()
            const $ = queryXml(result)

            chlMap.value = {}

            if ($('//status').text() === 'success') {
                pageData.value.chlList = $('//content/item').map((item) => {
                    const id = item.attr('id')!

                    // 新获取的通道列表若没有已选中的通道，移除该选中的通道
                    const index = formData.value.chls.indexOf('id')
                    if (index > -1) {
                        formData.value.chls.splice(index, 1)
                    }

                    chlMap.value[id] = item.text()

                    return {
                        id,
                        value: item.text(),
                    }
                })
            }
        }

        /**
         * @description 备份
         */
        const backUp = () => {
            if (!formData.value.chls.length) {
                return
            }

            const startTime = dayjs(formData.value.startTime, dateTime.dateTimeFormat).valueOf()
            const endTime = dayjs(formData.value.endTime, dateTime.dateTimeFormat).valueOf()
            if (endTime <= startTime) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_END_TIME_GREATER_THAN_START'),
                })
                return
            }
            if (mode.value === 'ocx' && Plugin.BackUpTask.isExeed(formData.value.chls.length)) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_BACKUP_TASK_NUM_LIMIT').formatForLang(Plugin.BackUpTask.limit),
                })
                return
            }
            pageData.value.backupRecList = formData.value.chls.map((chl) => {
                return {
                    chlId: chl,
                    chlName: chlMap.value[chl],
                    events: EVENTS,
                    startTime,
                    endTime,
                    streamType: 1,
                }
            })
            pageData.value.isBackUpPop = true
        }

        /**
         * @description 确认备份
         * @param {string} type
         * @param {string} path
         * @param {string} format
         */
        const confirmBackUp = (type: string, path: string, format: string) => {
            if (type === 'local') {
                if (mode.value === 'h5') {
                    pageData.value.isLocalBackUpPop = true
                } else if (mode.value === 'ocx') {
                    Plugin.BackUpTask.addTask(pageData.value.backupRecList, path, format)
                    router.push({
                        path: '/search-and-backup/backup-state',
                    })
                }
                pageData.value.isBackUpPop = false
            } else {
                pageData.value.isBackUpPop = false
            }
        }

        /**
         * @description 处理全选和取消全选
         * @param {boolean} bool
         */
        const toggleAllChl = (bool: string | number | boolean) => {
            if (bool === false) {
                formData.value.chls = []
            } else {
                formData.value.chls = pageData.value.chlList.map((item) => item.id).slice(0, maxChl.value)
            }
        }

        watch(
            mode,
            (newVal) => {
                if (newVal !== 'h5' && !Plugin.IsPluginAvailable) {
                    pluginStore.showPluginNoResponse = true
                    Plugin.ShowPluginNoResponse()
                }
                if (newVal === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Playback')
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            },
            {
                immediate: true,
            },
        )

        onMounted(async () => {
            Plugin.SetPluginNotice('#layout2Main')
            getChlsList()

            const date = new Date()
            formData.value.startTime = dayjs(date).hour(0).minute(0).second(0).format(dateTime.dateTimeFormat)
            formData.value.endTime = dayjs(date).hour(23).minute(59).second(59).format(dateTime.dateTimeFormat)
        })

        onBeforeUnmount(() => {
            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        return {
            mode,
            formData,
            dateTime,
            highlightWeekend,
            pageData,
            userAuth,
            confirmBackUp,
            backUp,
            toggleAllChl,
            isChlAll,
            BackupPop,
            BackupLocalPop,
        }
    },
})
