/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:10:28
 * @Description: 现场预览-目标检测视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 19:35:11
 */
import WebsocketSnap, { type WebsocketSnapOnSuccessSnap } from '@/utils/websocket/websocketSnap'
import LiveSnapFaceMatchItem from './LiveSnapFaceMatchItem.vue'
import LiveSnapItem from './LiveSnapItem.vue'
import LiveSnapStructItem from './LiveSnapStructItem.vue'
import LiveSnapInfoPop from './LiveSnapInfoPop.vue'
import IntelFaceDBSnapRegisterPop from '../intelligentAnalysis/IntelFaceDBSnapRegisterPop.vue'
import LiveSnapFaceMatchPop from './LiveSnapFaceMatchPop.vue'

export default defineComponent({
    components: {
        LiveSnapFaceMatchItem,
        LiveSnapItem,
        LiveSnapStructItem,
        LiveSnapInfoPop,
        IntelFaceDBSnapRegisterPop,
        LiveSnapFaceMatchPop,
    },
    props: {
        auth: {
            type: Object as PropType<UserChlAuth>,
            required: true,
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const router = useRouter()
        const dateTime = useDateTime()

        // 获取历史抓拍图片数量
        const SNAP_LIST_LENGTH = 40

        // const SNAP_TARGET_MAPPING: Record<string, string> = {
        //     person: 'person_info',
        //     vehicle: 'car_info',
        //     non_vehicle: 'bike_info',
        // }

        const pageData = ref({
            // 底部菜单
            menu: [
                {
                    type: 'real',
                    label: Translate('IDCS_REAL_TIME'),
                    maxlength: 5,
                },
                {
                    type: 'history',
                    label: Translate('IDCS_HISTORY'),
                    maxlength: 40,
                },
            ],
            // 当前菜单项索引
            activeMenu: 0,
            // 抓拍缓存队列
            snapListQueue: [] as WebsocketSnapOnSuccessSnap[],
            // 触发详情的项的索引
            infoIndex: 0,
            // 是否显示详情弹窗
            isInfoPop: false,
            // 详情弹窗的抓拍数据列表
            infoList: [] as WebsocketSnapOnSuccessSnap[],
            // 注册图片
            registerPic: '',
            // 是否显示注册弹窗
            isRegisterPop: false,
            // 车牌号码
            addPlateNum: '',
            // 是否显示车牌号码弹窗
            isAddPlatePop: false,
            // 触发人脸匹配的项的索引
            faceIndex: 0,
            // 人脸匹配弹窗的抓拍数据列表
            faceList: [] as WebsocketSnapOnSuccessSnap[],
            // 是否显示人脸匹配弹窗
            isFacePop: false,
        })

        let ws: WebsocketSnap | null = null

        /**
         * @description 获取权限
         * @param {String} chlId
         * @returns {Boolean}
         */
        const getAuth = (chlId: string) => {
            if (!prop.auth.hasAll && prop.auth.spr && !prop.auth.spr[chlId]) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_NO_AUTH'),
                })
                return false
            }
            return true
        }

        /**
         * @description 当前抓拍列表
         */
        const currentSnapList = computed(() => {
            return pageData.value.snapListQueue.slice(0, pageData.value.menu[pageData.value.activeMenu].maxlength)
        })

        /**
         * @description 获取有预览权限的通道
         */
        const getSnapData = async () => {
            const result = await getChlList({
                authList: '@lp',
            })
            const $ = queryXml(result)
            const chlIdList = $('/response/content/item').map((item) => ({
                channel_id: item.attr('id')!,
                face_detect: {
                    info: true,
                    detect_pic: true,
                    scene_pic: true,
                },
                face_verify: {
                    info: true,
                    detect_pic: true,
                    scene_pic: true,
                    repo_pic: true,
                },
                vehicle_plate: {
                    info: true,
                    detect_pic: true,
                    scene_pic: true,
                },
                boundary: {
                    info: true,
                    detect_pic: true,
                    scene_pic: true,
                },
            }))

            ws = new WebsocketSnap({
                config: chlIdList,
                onsuccess(arr) {
                    pageData.value.snapListQueue = [...(arr as WebsocketSnapOnSuccessSnap[]), ...pageData.value.snapListQueue]
                    // 只保存最多40条的数据，用于显示历史数据列表，避免长时间抓拍数据量太大
                    pageData.value.snapListQueue = pageData.value.snapListQueue.slice(0, SNAP_LIST_LENGTH)
                    // 实时列表才更新抓拍墙，历史列表不更新
                },
            })
        }

        /**
         * @description 切换菜单
         * @param {number} index
         */
        const changeMenu = (index: number) => {
            pageData.value.activeMenu = index
        }

        /**
         * @description 回放
         * @param {Object} data
         */
        const playRec = (data: WebsocketSnapOnSuccessSnap) => {
            if (!getAuth(data.chlId)) {
                return
            }
            router.push({
                path: '/playback',
                state: {
                    chlId: data.chlId,
                    chlName: data.chlName,
                    startTime: data.detect_time - 5000,
                    endTime: data.detect_time + 5000,
                },
            })
        }

        /**
         * @description 搜索
         * @param {Object} data
         * @param {String} type
         */
        const search = (data: WebsocketSnapOnSuccessSnap, type = '') => {
            if (!getAuth(data.chlId)) {
                return
            }
            if (data.type === 'face_detect' || data.type === 'face_verify') {
                if (type === 'featureImg') {
                    // 按右侧的比对成功的人脸库图片搜索
                    const searchInfo = {
                        picType: 'faceFeaturePic', // 人脸库图片
                        id: data.info.face_respo_id,
                        name: data.info.name,
                        birthday: data.info.birth_date,
                        certificateNum: data.info.certificate_number,
                        mobile: data.info.mobile_phone_number,
                        content1: 'data:image/png;base64,' + data.repo_pic,
                    }
                    router.push({
                        path: 'intelligent-analysis/search/search-face',
                        state: searchInfo,
                    })
                } else {
                    // 按左侧的抓拍图片搜索
                    const searchInfo = {
                        chlId: data.chlId,
                        imgId: data.info.face_id,
                        frameTime: data.frame_time,
                        content: 'data:image/png;base64,' + data.snap_pic,
                    }
                    router.push({
                        path: 'intelligent-analysis/search/search-body',
                        state: searchInfo,
                    })
                }
            } else if (data.type === 'boundary') {
                const searchInfo = {
                    eventType: data.info.event_type,
                    targetType: data.info.target_type,
                }
                router.push({
                    path: 'intelligent-analysis/search/search-combine',
                    state: searchInfo,
                })
            } else if (data.type === 'vehicle_plate') {
                let eventType = 'plateDetection'
                if (data.info.compare_status) {
                    eventType = data.info.compare_status == 1 ? 'plateMatchWhiteList' : 'plateMatchStranger'
                }
                const searchInfo = {
                    type: data.type,
                    eventType: eventType,
                    plateNum: data.info.plate,
                }
                router.push({
                    path: 'intelligent-analysis/search/search-vehicle',
                    state: searchInfo,
                })
            }
        }

        /**
         * @description 打开详情弹窗
         * @param {Number} index
         */
        const showDetail = (index: number) => {
            pageData.value.infoIndex = index
            pageData.value.infoList = pageData.value.snapListQueue.slice(0, pageData.value.menu[pageData.value.activeMenu].maxlength)
            pageData.value.isInfoPop = true
        }

        /**
         * @description 注册
         * @param {Object} value
         */
        const register = (value: WebsocketSnapOnSuccessSnap) => {
            if (value.type === 'face_detect') {
                pageData.value.registerPic = value.snap_pic!
                pageData.value.isRegisterPop = true
            } else if (value.type === 'vehicle_plate') {
                pageData.value.addPlateNum = value.info.plate!
                pageData.value.isAddPlatePop = true
                // TODO: 新增车牌弹窗
            }
        }

        /**
         * @description 打开人脸匹配弹窗
         * @param {Number} index
         */
        const showFaceDetail = (index: number) => {
            const faceId = currentSnapList.value[index].info.face_id
            pageData.value.faceList = pageData.value.snapListQueue.slice(0, pageData.value.menu[pageData.value.activeMenu].maxlength).filter((item) => item.type === 'face_verify')
            pageData.value.faceIndex = pageData.value.faceList.findIndex((item) => {
                return item.info.face_id === faceId
            })
            pageData.value.isFacePop = true
        }

        onMounted(async () => {
            await dateTime.getTimeConfig()
            getSnapData()
        })

        onBeforeUnmount(() => {
            ws?.destroy()
            ws = null
        })

        return {
            pageData,
            dateTime,
            changeMenu,
            playRec,
            search,
            showDetail,
            register,
            currentSnapList,
            showFaceDetail,
            LiveSnapFaceMatchItem,
            LiveSnapItem,
            LiveSnapStructItem,
            LiveSnapInfoPop,
            IntelFaceDBSnapRegisterPop,
            LiveSnapFaceMatchPop,
        }
    },
})
