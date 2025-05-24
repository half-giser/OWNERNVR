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
import LiveSnapVehiclePlateItem from './LiveSnapVehiclePlateItem.vue'
import LiveSnapPop from './LiveSnapPop.vue'
import fetch from '@/api/api'

export default defineComponent({
    components: {
        LiveSnapFaceMatchItem,
        LiveSnapItem,
        LiveSnapStructItem,
        IntelFaceDBSnapRegisterPop,
        IntelLicencePlateDBAddPlatePop,
        LiveSnapVehiclePlateItem,
        LiveSnapPop,
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

        const faceListMapping: WebsocketSnapOnSuccessSnap[] = []
        let infoListMapping: WebsocketSnapOnSuccessSnap[] = []

        const TARGET_MAPPING: Record<string, string> = {
            face_detect: 'face',
            face_verify: 'face',
            vehicle_plate: 'vehicle_plate',
            boundary: 'person',
            non_vehicle: 'non_vehicle',
        }

        const EVENT_TYPE: Record<string, string> = {
            perimeter: 'boundary',
            aoi_entry: 'boundary',
            aoi_leave: 'boundary',
            tripwire: 'boundary',
            pass_line: 'boundary',
            video_metavideo: 'boundary',
            face_detect: 'face_detect',
            face_verify: 'face_verify',
            vehicle_plate: 'vehicle_plate',
            plate: 'vehicle_plate',
        }

        const CERTIFACATE_TYPE_MAPPING: Record<number, string> = {
            0: 'idCard', // 目前只有身份证
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

            // 是否显示抓拍弹窗
            isSnapPop: false,
            // 抓拍弹窗的抓拍数据列表
            snapList: [] as WebsocketSnapOnSuccessSnap[],
            // 触发抓拍弹窗的项的索引
            snapIndex: 0,
            // 打开弹窗的类型
            openType: 'normal',
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
                fire_detect: {
                    info: true,
                    detect_pic: true,
                    scene_pic: true,
                },
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
         * @description 导出图片回调
         */
        const handleSnapExport = (_item: any, index: number) => {
            return backup(infoListMapping[index])
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
                    startTime: data.detect_time - 2000,
                    endTime: data.detect_time + 2000,
                },
            })
        }

        /**
         * @description 搜索
         * @param {Object} data
         * @param {String} type
         */
        const search = async (data: WebsocketSnapOnSuccessSnap, type = '') => {
            // todo

            if (!getAuth(data.chlId)) {
                return
            }

            const targetType = data.info!.target_type
            const isFaceCompare = data.type === 'face_detect' || data.type === 'face_verify'

            let eventType = data.info!.event_type
            let menuType = targetType?.includes('vehicle') ? 'vehicle' : 'person'

            if (data.type === 'vehicle_plate') {
                // 车牌侦测事件
                menuType = 'vehicle'
                eventType = 'plateDetection'
                if (data.info!.compare_status) {
                    eventType = data.info!.compare_status === 1 ? 'plateMatchWhiteList' : 'plateMatchStranger'
                }
            }

            const imgBase64 = type === 'featureImg' ? data.repo_pic! : data.snap_pic!

            const { width, height } = await getImgSize(imgBase64)

            const searchInfo: Record<string, any> = {
                menuType: menuType, // person：人，vehicle：车，searchTarget：目标检索
                isFaceCompare: isFaceCompare, // 是否是人脸比对
                data: {
                    type: data.type,
                    eventType: eventType,
                    targetType: data.info!.target_type,
                    dataInfo: data.info,
                    content: imgBase64,
                    chlId: data.chlId,
                    frameTime: data.detect_time,
                    ptWidth: width,
                    ptHeight: height,
                },
            }

            // NTA1-3904 人脸库图片跳转到智能分析时，需要携带对应的人员信息
            if (type === 'featureImg') {
                searchInfo.faceFeatureCache = {
                    '@id': data.info!.face_id,
                    faceFeatureId: data.info!.face_respo_id,
                    data: imgBase64,
                    picWidth: width,
                    picHeight: height,
                    number: data.info!.serial_number,
                    name: data.info!.name,
                    note: data.info!.remarks,
                    sex: data.info!.gender,
                    birthday: data.info!.birth_date,
                    nativePlace: data.info!.hometown,
                    certificateType: CERTIFACATE_TYPE_MAPPING[data.info!.certificate_type ?? 0],
                    certificateNum: data.info!.certificate_number,
                    mobile: data.info!.mobile_phone_number,
                    createTime: '',
                    faceImgCount: data.info!.faceImgCount,
                    groups: [
                        {
                            groupName: data.info!.group_name,
                        },
                    ],
                    content1: 'data:image/png;base64,' + imgBase64,
                }
            }

            if (eventType === 'fire_detection') {
                router.push({
                    path: '/search-and-backup/by-time-slice',
                    state: {
                        data: JSON.stringify(searchInfo),
                    },
                })
                return
            }

            if (isFaceCompare) {
                if (searchInfo.faceFeatureCache && (searchInfo.faceFeatureCache.faceFeatureId || String(searchInfo.faceFeatureCache.faceFeatureId) === '0')) {
                    router.push({
                        path: '/intelligent-analysis/search/search-face',
                        state: {
                            data: JSON.stringify(searchInfo),
                        },
                    })
                    return
                }

                openLoading()
                try {
                    const targetData = await getDetectResultInfos(imgBase64, width, height)
                    const featureData = await extractTragetInfos(targetData)
                    searchInfo.data.searchByImageFeatureData = featureData
                    router.push({
                        path: '/intelligent-analysis/search/search-face',
                        state: {
                            data: JSON.stringify(searchInfo),
                        },
                    })
                    return
                } catch {
                    openMessageBox(Translate('IDCS_UNQUALIFIED_PICTURE'))
                }
                closeLoading()
            }

            if (menuType === 'vehicle') {
                router.push({
                    path: '/intelligent-analysis/search/search-vehicle',
                    state: {
                        data: JSON.stringify(searchInfo),
                    },
                })

                return
            }

            if (menuType === 'person') {
                router.push({
                    path: '/intelligent-analysis/search/search-face',
                    state: {
                        data: JSON.stringify(searchInfo),
                    },
                })
                return
            }
        }

        /**
         *
         * @description 导出 TODO 等待备份功能实现
         * @param data
         */
        const backup = async (data: WebsocketSnapOnSuccessSnap) => {
            console.log('导出', data)
        }

        const getDetectResultInfos = async (imgData: string, imgWidth: number, imgHeight: number) => {
            if (!imgData || !imgWidth || !imgHeight) {
                return
            }

            imgData = imgData.includes(';base64,') ? imgData.split(',')[1] : imgData

            const sendXml = rawXml`
                <content>
                    <detectImgInfos>
                        <item index="1">
                            <imgWidth>${imgWidth}</imgWidth>
                            <imgHeight>${imgHeight}</imgHeight>
                            <imgFormat>jpg</imgFormat>
                            <imgData>${imgData}</imgData>
                        </item>
                    </detectImgInfos>
                </content>
            `
            const result = await fetch('detectTarget', sendXml)
            const $ = queryXml(result)
            const targetData = $('content/detectResultInfos/Item').map((item) => {
                const $item = queryXml(item.element)
                const detectIndex = item.attr('index').num()
                return {
                    detectIndex: detectIndex,
                    detectImgInfo: {
                        detectIndex: 1,
                        imgData,
                        imgWidth,
                        imgHeight,
                        imgFormat: 'jpg',
                    },
                    targetList: $item('targetList/item').map((el) => {
                        const $el = queryXml(el.element)
                        return {
                            targetId: el.attr('id').num(),
                            targetType: $el('targetType').text(),
                            rect: {
                                leftTop: {
                                    x: $el('rect/leftTop/x').text().num(),
                                    y: $el('rect/leftTop/y').text().num(),
                                },
                                rightBottom: {
                                    x: $el('rect/rightBottom/x').text().num(),
                                    y: $el('rect/rightBottom/y').text().num(),
                                },
                                scaleWidth: $el('rect/scaleWidth').text().num(),
                                scaleHeight: $el('rect/scaleHeight').text().num(),
                            },
                            featurePointInfos: $el('featurePointInfos/item').map((point) => {
                                const $point = queryXml(point.element)
                                return {
                                    faceFeatureIndex: point.attr('index'),
                                    x: $point('x').text().num(),
                                    y: $point('y').text().num(),
                                }
                            }),
                        }
                    }),
                }
            })

            if (targetData.length) {
                const find = targetData[0].targetList.find((item) => item.targetType === 'humanFace') // humanFace humanBody
                if (find) {
                    return {
                        detectImgInfo: targetData[0].detectImgInfo,
                        targetItem: find,
                    }
                } else {
                    throw new Error('')
                }
            }

            throw new Error('')
        }

        const extractTragetInfos = async (data: Awaited<ReturnType<typeof getDetectResultInfos>>) => {
            const detectImgInfo = data!.detectImgInfo
            const targetItem = data!.targetItem
            const sendXml = rawXml`
                <content>
                    <extractImgInfos>
                            <item index="${detectImgInfo.detectIndex}">
                                <imgWidth>${detectImgInfo.imgWidth}</imgWidth>
                                <imgHeight>${detectImgInfo.imgHeight}</imgHeight>
                                <imgFormat>${detectImgInfo.imgFormat}</imgFormat>
                                <imgData>${detectImgInfo.imgData}</imgData>
                                <rect>
                                    <leftTop>
                                        <x>${targetItem.rect.leftTop.x}</x>
                                        <y>${targetItem.rect.leftTop.y}</y>
                                    </leftTop>
                                    <rightBottom>
                                        <x>${targetItem.rect.rightBottom.x}</x>
                                        <y>${targetItem.rect.rightBottom.y}</y>
                                    </rightBottom>
                                    <scaleWidth>${targetItem.rect.scaleWidth}</scaleWidth>
                                    <scaleHeight>${targetItem.rect.scaleHeight}</scaleHeight>
                                </rect>
                                <targetType>${targetItem.targetType}</targetType>
                                <featurePointInfos>
                                    ${targetItem.featurePointInfos
                                        .map((point) => {
                                            return rawXml`
                                                <item index="${point.faceFeatureIndex}">
                                                    <x>${point.x}</x>
                                                    <y>${point.y}</y>
                                                </item>
                                            `
                                        })
                                        .join('')}
                                </featurePointInfos>
                            </item>
                    </extractImgInfos>
                </content>
            `
            const result = await fetch('extractTraget', sendXml)
            const $ = queryXml(result)
            return $('extractResultInfos/item/featureData').text()
        }

        /**
         * @description 打开详情弹窗，将wensocket返回的数据格式转换为弹窗接受的数据格式
         * @param {Number} index
         */
        const showDetail = (index: number, openType: string) => {
            pageData.value.openType = openType
            infoListMapping = pageData.value.snapListQueue.slice(0, pageData.value.menu[pageData.value.activeMenu].maxlength)
            console.log('infoListMapping', infoListMapping)
            pageData.value.snapIndex = index
            pageData.value.snapList = infoListMapping.map((item) => {
                let eventType = EVENT_TYPE[item.info!.event_type] || EVENT_TYPE[item.type] || ''
                const compareType = COMPARE_TYPE[item.info!.compare_status] || ''
                if (eventType === 'plateDetection' && compareType !== '') {
                    eventType = 'plateMatch'
                }

                let attribute: Record<string, string | number> = {}
                if (item.info!.person_info) {
                    attribute = item.info!.person_info
                } else if (item.info!.car_info) {
                    attribute = item.info!.car_info
                } else if (item.info!.bike_info) {
                    attribute = item.info!.bike_info
                } else if (item.info!.plate) {
                    if (item.info!.owner) {
                        attribute.owner = item.info!.owner
                    }

                    if (item.info!.mobile_phone_number) {
                        attribute.mobile_phone_number = item.info!.mobile_phone_number
                    }
                }
                return {
                    imgId: item.info!.face_id,
                    snap_pic: item.snap_pic ? wrapBase64Img(item.snap_pic) : '',
                    scene_pic: item.scene_pic ? wrapBase64Img(item.scene_pic) : '',
                    repo_pic: item.repo_pic ? wrapBase64Img(item.repo_pic) : '',
                    detect_time: item.detect_time,
                    frame_time: item.frame_time,
                    chlId: item.chlId,
                    chlName: item.chlName,
                    recStartTime: item.detect_time - 5000,
                    recEndTime: item.detect_time + 5000,
                    type: eventType,
                    target_type: TARGET_MAPPING[item.type] || '',
                    plateNumber: item.info!.plate || '',
                    info: item.info,
                    attribute,
                }
            })
            pageData.value.isSnapPop = true
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
                pageData.value.addPlateNum = value.info!.plate!
                pageData.value.isAddPlatePop = true
            }
        }

        //     faceListMapping = pageData.value.snapListQueue.slice(0, pageData.value.menu[pageData.value.activeMenu].maxlength).filter((item) => item.type === 'face_verify')
        //     // const faceId = currentSnapList.value[index].info!.face_id
        //     // pageData.value.faceList = faceListMapping.map((item) => {
        //     //     const width = item.info!.ptWidth || 10000
        //     //     const height = item.info!.ptHeight || 10000
        //     //     let X1 = 0,
        //     //         X2 = 0,
        //     //         Y1 = 0,
        //     //         Y2 = 0
        //     //     const pointLeftTop = item.info!.point_left_top
        //     //     const pointRightBottm = item.info!.point_right_bottom
        //     //     if (pointLeftTop && pointRightBottm) {
        //     //         const leftTop = pointLeftTop.slice(1, -1).split(',')
        //     //         const rightBottom = pointRightBottm.slice(1, -1).split(',')
        //     //         X1 = Number(leftTop[0]) / width
        //     //         X2 = Number(rightBottom[0]) / width
        //     //         Y1 = Number(leftTop[1]) / height
        //     //         Y2 = Number(rightBottom[1]) / height
        //     //     }

        //     //     let eventType = EVENT_TYPE[item.info!.event_type] || EVENT_TYPE[item.type] || ''
        //     //     const compareType = COMPARE_TYPE[item.info!.compare_status] || ''
        //     //     if (eventType === 'plateDetection' && compareType !== '') {
        //     //         eventType = 'plateMatch'
        //     //     }

        //     //     return {
        //     //         imgId: item.info!.face_id,
        //     //         pic: item.snap_pic ? wrapBase64Img(item.snap_pic) : '',
        //     //         match: item.repo_pic ? wrapBase64Img(item.repo_pic) : '',
        //     //         timestamp: item.detect_time,
        //     //         frameTime: item.frame_time,
        //     //         chlId: item.chlId,
        //     //         chlName: item.chlName,
        //     //         recStartTime: item.detect_time - 5000,
        //     //         recEndTime: item.detect_time + 5000,
        //     //         eventType: eventType + compareType,
        //     //         targetType: TARGET_MAPPING[item.type] || '',
        //     //         similarity: Number(item.info!.similarity),

        //     //         number: item.info!.serial_number,
        //     //         name: item.info!.name,
        //     //         sex: item.info!.gender,
        //     //         birthday: item.info!.birth_date,
        //     //         nativePlace: '',
        //     //         certificateType: '',
        //     //         certificateNum: item.info!.certificate_number,
        //     //         mobile: item.info!.mobile_phone_number,
        //     //         note: item.info!.remarks || '',
        //     //         groupName: item.info!.group_name,

        //     //         panorama: item.scene_pic ? wrapBase64Img(item.scene_pic) : '',
        //     //         width,
        //     //         height,
        //     //         X1,
        //     //         Y1,
        //     //         X2,
        //     //         Y2,
        //     //     }
        //     // })
        //     // pageData.value.faceIndex = pageData.value.faceList.findIndex((item) => {
        //     //     return item.imgId === faceId
        //     // })
        //     // pageData.value.isFacePop = true
        // }

        // 获取图片宽高

        const getImgSize = (imgBase64: string) => {
            return new Promise((resolve: (size: { width: number; height: number }) => void) => {
                const img = new Image()
                img.onload = () => {
                    const width = img.width
                    const height = img.height
                    resolve({ width, height })
                }
                img.src = 'data:image/jpg;base64,' + imgBase64
            })
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
            backup,
            showDetail,
            register,
            currentSnapList,
            // showFaceDetail,
            handleSnapRec,
            handleSnapRegister,
            handleSnapSearch,
            handleSnapExport,
            handleMatchSnapRec,
            handleMatchSnapSearch,
        }
    },
})
