/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:10:28
 * @Description: 现场预览-目标检测视图
 */
import LiveSnapFaceMatchItem from './LiveSnapFaceMatchItem.vue'
import LiveSnapItem from './LiveSnapItem.vue'
import LiveSnapStructItem from './LiveSnapStructItem.vue'
import IntelFaceDBSnapRegisterPop from '../intelligentAnalysis/IntelFaceDBSnapRegisterPop.vue'
import IntelLicencePlateDBAddPlatePop from '../intelligentAnalysis/IntelLicencePlateDBAddPlatePop.vue'
import IntelBaseFaceMatchPop from '../intelligentAnalysis/IntelBaseFaceMatchPop.vue'
import IntelBaseSnapPop from '../intelligentAnalysis/IntelBaseSnapPop.vue'

export default defineComponent({
    components: {
        LiveSnapFaceMatchItem,
        LiveSnapItem,
        LiveSnapStructItem,
        IntelFaceDBSnapRegisterPop,
        IntelLicencePlateDBAddPlatePop,
        IntelBaseSnapPop,
        IntelBaseFaceMatchPop,
    },
    props: {
        /**
         * @property 用户通道权限
         */
        auth: {
            type: Object as PropType<UserChlAuth>,
            required: true,
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const router = useRouter()

        // 由于Webscoket回传和HTTP请求的事件类型和目标类型的key值命名不同，所以需根据映射关系对列表数据重新组装

        let faceListMapping: WebsocketSnapOnSuccessSnap[] = []
        let infoListMapping: WebsocketSnapOnSuccessSnap[] = []

        const TARGET_MAPPING: Record<string, string> = {
            face_detect: 'face',
            face_verify: 'face',
            vehicle_plate: 'vehicle_plate',
            boundary: 'person',
            non_vehicle: 'non_vehicle',
        }

        const EVENT_TYPE: Record<string, string> = {
            perimeter: 'intrusion',
            aoi_entry: 'intrusion',
            aoi_leave: 'intrusion',
            tripwire: 'tripwire',
            pass_line: 'passLine',
            video_metavideo: 'videoMetadata',
            face_detect: 'faceDetection',
            face_verify: 'faceMatch',
            vehicle_plate: 'plateDetection',
            plate: 'plateMatch',
        }

        const COMPARE_TYPE: Record<number, string> = {
            1: '',
            3: 'Stranger',
            4: 'Stranger',
            6: 'WhiteList',
        }

        // 获取历史抓拍图片数量
        const SNAP_LIST_LENGTH = 40

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
            infoList: [] as IntelSnapPopList[],
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
            faceList: [] as IntelFaceMatchPopList[],
            // 是否显示人脸匹配弹窗
            isFacePop: false,
        })

        let ws: ReturnType<typeof WebsocketSnap> | null = null

        /**
         * @description 获取权限
         * @param {String} chlId
         * @returns {Boolean}
         */
        const getAuth = (chlId: string) => {
            if (!prop.auth.hasAll && prop.auth.spr && !prop.auth.spr[chlId]) {
                openMessageBox(Translate('IDCS_NO_AUTH'))
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
            const chlIdList = $('content/item').map((item) => ({
                channel_id: item.attr('id'),
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

            ws = WebsocketSnap({
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
         * @description 抓拍详情弹窗回放回调
         * @param item
         * @param {number} index
         * @returns
         */
        const handleSnapRec = (_item: any, index: number) => {
            return playRec(infoListMapping[index])
        }

        /**
         * @description 抓拍详情弹窗注册回调
         * @param item
         * @param {number} index
         * @returns
         */
        const handleSnapRegister = (_item: any, index: number) => {
            return register(infoListMapping[index])
        }

        /**
         * @description 抓拍详情弹窗搜索回调
         * @param item
         * @param {number} index
         * @returns
         */
        const handleSnapSearch = (_item: any, index: number) => {
            return search(infoListMapping[index])
        }

        /**
         * @description 匹配详情弹窗回放回调
         * @param item
         * @param {number} index
         * @returns
         */
        const handleMatchSnapRec = (_item: any, index: number) => {
            return search(faceListMapping[index])
        }

        /**
         * @description 匹配抓拍详情弹窗搜索回调
         * @param item
         * @param {number} index
         * @returns
         */
        const handleMatchSnapSearch = (_item: any, index: number) => {
            return search(faceListMapping[index])
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
                if (type === 'face') {
                    // 按右侧的比对成功的人脸库图片搜索
                    const searchInfo = {
                        picType: 'face', // 人脸库图片
                        id: data.info.face_respo_id,
                        name: data.info.name,
                        birthday: data.info.birth_date,
                        certificateNum: data.info.certificate_number,
                        mobile: data.info.mobile_phone_number,
                        pic: data.repo_pic ? wrapBase64Img(data.repo_pic) : '',
                    }
                    router.push({
                        path: '/intelligent-analysis/search/search-face',
                        state: searchInfo,
                    })
                } else {
                    // 按左侧的抓拍图片搜索
                    const searchInfo = {
                        picType: 'snap',
                        chlId: data.chlId,
                        imgId: data.info.face_id,
                        frameTime: data.frame_time,
                        pic: data.snap_pic ? wrapBase64Img(data.snap_pic) : '',
                    }
                    router.push({
                        path: '/intelligent-analysis/search/search-face',
                        state: searchInfo,
                    })
                }
            } else if (data.type === 'boundary') {
                const searchInfo = {
                    eventType: data.info.event_type,
                    targetType: data.info.target_type,
                }
                router.push({
                    path: '/intelligent-analysis/search/search-body',
                    state: searchInfo,
                })
            } else if (data.type === 'vehicle_plate') {
                let eventType = 'plateDetection'
                if (data.info.compare_status) {
                    eventType = data.info.compare_status === 1 ? 'plateMatchWhiteList' : 'plateMatchStranger'
                }
                const searchInfo = {
                    type: data.type,
                    eventType: eventType,
                    plateNum: data.info.plate,
                }
                router.push({
                    path: '/intelligent-analysis/search/search-vehicle',
                    state: searchInfo,
                })
            }
        }

        /**
         * @description 打开详情弹窗，将wensocket返回的数据格式转换为弹窗接受的数据格式
         * @param {Number} index
         */
        const showDetail = (index: number) => {
            infoListMapping = pageData.value.snapListQueue.slice(0, pageData.value.menu[pageData.value.activeMenu].maxlength)
            pageData.value.infoIndex = index
            pageData.value.infoList = infoListMapping.map((item) => {
                const width = item.info.ptWidth || 10000
                const height = item.info.ptHeight || 10000
                let X1 = 0,
                    X2 = 0,
                    Y1 = 0,
                    Y2 = 0
                const pointLeftTop = item.info.point_left_top
                const pointRightBottm = item.info.point_right_bottom
                if (pointLeftTop && pointRightBottm) {
                    const leftTop = pointLeftTop.slice(1, -1).split(',')
                    const rightBottom = pointRightBottm.slice(1, -1).split(',')
                    X1 = Number(leftTop[0]) / width
                    X2 = Number(rightBottom[0]) / width
                    Y1 = Number(leftTop[1]) / height
                    Y2 = Number(rightBottom[1]) / height
                }

                let eventType = EVENT_TYPE[item.info.event_type] || EVENT_TYPE[item.type] || ''
                const compareType = COMPARE_TYPE[item.info.compare_status] || ''
                if (eventType === 'plateDetection' && compareType !== '') {
                    eventType = 'plateMatch'
                }

                let attribute: Record<string, string | number> = {}
                if (item.info.person_info) {
                    attribute = item.info.person_info
                } else if (item.info.car_info) {
                    attribute = item.info.car_info
                } else if (item.info.bike_info) {
                    attribute = item.info.bike_info
                } else if (item.info.plate) {
                    if (item.info.owner) {
                        attribute.owner = item.info.owner
                    }

                    if (item.info.mobile_phone_number) {
                        attribute.mobile_phone_number = item.info.mobile_phone_number
                    }
                }

                return {
                    imgId: item.info.face_id,
                    pic: item.snap_pic ? wrapBase64Img(item.snap_pic) : '',
                    panorama: item.scene_pic ? wrapBase64Img(item.scene_pic) : '',
                    width,
                    height,
                    X1,
                    Y1,
                    X2,
                    Y2,
                    timestamp: item.detect_time,
                    frameTime: item.frame_time,
                    chlId: item.chlId,
                    chlName: item.chlName,
                    recStartTime: item.detect_time - 5000,
                    recEndTime: item.detect_time + 5000,
                    eventType: eventType + compareType,
                    targetType: TARGET_MAPPING[item.type] || '',
                    plateNumber: item.info.plate || '',
                    attribute,
                }
            })
            pageData.value.isInfoPop = true
        }

        /**
         * @description 注册
         * @param {Object} value
         */
        const register = (value: WebsocketSnapOnSuccessSnap) => {
            if (value.type === 'face_detect' || value.type === 'face_verify') {
                pageData.value.registerPic = wrapBase64Img(value.snap_pic!)
                pageData.value.isRegisterPop = true
            } else if (value.type === 'vehicle_plate') {
                pageData.value.addPlateNum = value.info.plate!
                pageData.value.isAddPlatePop = true
            }
        }

        /**
         * @description 打开人脸匹配弹窗
         * @param {Number} index
         */
        const showFaceDetail = (index: number) => {
            faceListMapping = pageData.value.snapListQueue.slice(0, pageData.value.menu[pageData.value.activeMenu].maxlength).filter((item) => item.type === 'face_verify')
            const faceId = currentSnapList.value[index].info.face_id
            pageData.value.faceList = faceListMapping.map((item) => {
                const width = item.info.ptWidth || 10000
                const height = item.info.ptHeight || 10000
                let X1 = 0,
                    X2 = 0,
                    Y1 = 0,
                    Y2 = 0
                const pointLeftTop = item.info.point_left_top
                const pointRightBottm = item.info.point_right_bottom
                if (pointLeftTop && pointRightBottm) {
                    const leftTop = pointLeftTop.slice(1, -1).split(',')
                    const rightBottom = pointRightBottm.slice(1, -1).split(',')
                    X1 = Number(leftTop[0]) / width
                    X2 = Number(rightBottom[0]) / width
                    Y1 = Number(leftTop[1]) / height
                    Y2 = Number(rightBottom[1]) / height
                }

                let eventType = EVENT_TYPE[item.info.event_type] || EVENT_TYPE[item.type] || ''
                const compareType = COMPARE_TYPE[item.info.compare_status] || ''
                if (eventType === 'plateDetection' && compareType !== '') {
                    eventType = 'plateMatch'
                }

                return {
                    imgId: item.info.face_id,
                    pic: item.snap_pic ? wrapBase64Img(item.snap_pic) : '',
                    match: item.repo_pic ? wrapBase64Img(item.repo_pic) : '',
                    timestamp: item.detect_time,
                    frameTime: item.frame_time,
                    chlId: item.chlId,
                    chlName: item.chlName,
                    recStartTime: item.detect_time - 5000,
                    recEndTime: item.detect_time + 5000,
                    eventType: eventType + compareType,
                    targetType: TARGET_MAPPING[item.type] || '',
                    similarity: Number(item.info.similarity),

                    number: item.info.serial_number,
                    name: item.info.name,
                    sex: item.info.gender,
                    birthday: item.info.birth_date,
                    nativePlace: '',
                    certificateType: '',
                    certificateNum: item.info.certificate_number,
                    mobile: item.info.mobile_phone_number,
                    note: item.info.remarks || '',
                    groupName: item.info.group_name,

                    panorama: item.scene_pic ? wrapBase64Img(item.scene_pic) : '',
                    width,
                    height,
                    X1,
                    Y1,
                    X2,
                    Y2,
                }
            })
            pageData.value.faceIndex = pageData.value.faceList.findIndex((item) => {
                return item.imgId === faceId
            })
            pageData.value.isFacePop = true
        }

        onMounted(async () => {
            getSnapData()
        })

        onBeforeUnmount(() => {
            ws?.destroy()
            ws = null
        })

        return {
            pageData,
            changeMenu,
            playRec,
            search,
            showDetail,
            register,
            currentSnapList,
            showFaceDetail,
            handleSnapRec,
            handleSnapRegister,
            handleSnapSearch,
            handleMatchSnapRec,
            handleMatchSnapSearch,
        }
    },
})
