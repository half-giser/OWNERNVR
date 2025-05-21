<!--
 * @Date: 2025-05-20 20:11:39
 * @Description: 
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        :title="Translate('IDCS_DETAIL')"
        width="950"
        @open="open"
    >
        <div class="dialog">
            <div
                v-if="pageData.type === ''"
                class="target"
            >
                <img
                    class="target-pano"
                    :src="displayImg(current.thermal_scene_pic || current.scene_pic)"
                />
                <img class="target-snap" />
                <div class="target-wrap">
                    <div class="target-box"></div>
                    <div class="target-text"></div>
                </div>
            </div>
            <div
                v-if="pageData.type === 'faceCompare'"
                class="compare"
            >
                <div class="compare-snap">
                    <img :src="displayImg(current.snap_pic)" />
                </div>
                <div class="compare-info">
                    <div>
                        <img :src="displayImg(current.repo_pic)" />
                    </div>
                    <el-form>
                        <el-form-item :label="Translate('IDCS_NAME_PERSON')">
                            {{ current.info.name }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_SEX')">
                            {{ displayGender(current.info.sex) }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_NUMBER')">
                            {{ current.info.serial_number }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                            {{ current.info.mobile_phone_number }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                            {{ displayDate(current.info.birth_date) }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_NATIVE_PLACE')">
                            {{ current.info.hometown }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                            {{ current.info.group_name }}
                        </el-form-item>
                        <div class="split-line"></div>
                        <el-form-item :label="Translate('IDCS_ID_TYPE')">
                            {{ Translate('IDCS_ID_CARD') }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_ID_NUMBER')">
                            {{ current.info.certificate_number }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_REMARK')">
                            {{ current.info.remarks }}
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div
                v-if="current.type === 'vehicle_plate'"
                class="plate-compare"
            >
                <div class="compare-snap">
                    <img src="" />
                </div>
                <div class="compare-info">
                    <el-form>
                        <el-form-item>{{ current.info.plate }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_VEHICLE_OWNER')">
                            {{ current.info.owner }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                            {{ current.info.mobile_phone_number }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_PLATE_LIBRARY_GROUP')">
                            {{ current.info.group_name }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_PLATE_COLOR')">
                            {{ displayPlateColor(current.info.platecolor) }}
                        </el-form-item>
                        <div class="split-line"></div>
                        <el-form-item :label="Translate('IDCS_VEHICLE_COLOR')">
                            {{ displayVehicleColor(current.info.color) }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_VEHICLE_TYPE_ALL')">
                            {{ displayVehicleType(current.info.type) }}
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_VEHICLE_BRAND')">
                            {{ displayBrand(current.info.brand_type) }}
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div
                v-show="pageData.isBtnVisible"
                class="btns"
            >
                <div
                    class="btn"
                    :class="{
                        disabled: pageData.index === 0,
                    }"
                    @click="handlePrev"
                >
                    {{ Translate('IDCS_PREVIOUS') }}
                </div>
                <div
                    class="btn"
                    :class="{
                        disabled: pageData.index === pageData.list.length - 1,
                    }"
                    @click="handleNext"
                >
                    {{ Translate('IDCS_NEXT') }}
                </div>
            </div>
        </div>
        <div class="base-btn-box space-between">
            <div>
                <div class="event-type"></div>
                <div>
                    <div class="frame-time"></div>
                    <div class="chl-name"></div>
                </div>
            </div>
            <div>
                <BaseImgSpriteBtn
                    v-if="systemCaps.supportREID"
                    file="target_retrieval"
                    :title="Translate('IDCS_REID')"
                />
                <BaseImgSpriteBtn
                    file="snap_search"
                    :title="Translate('IDCS_SEARCH')"
                />
                <BaseImgSpriteBtn
                    v-if="isRegisterBtn"
                    file="register"
                    :title="Translate('IDCS_REGISTER')"
                />
                <BaseImgSpriteBtn
                    file="export_btn"
                    :title="Translate('IDCS_EXPORT')"
                />
                <BaseImgSpriteBtn
                    file="recPlay"
                    :title="Translate('IDCS_REPLAY')"
                />
                <BaseImgSpriteBtn
                    file="snap_exit"
                    :title="Translate('IDCS_EXIT')"
                />
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
export default defineComponent({
    props: {
        list: {
            type: Array as PropType<WebsocketSnapOnSuccessSnap[]>,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        openType: {
            type: String as PropType<'faceCompare' | 'normal'>,
            default: 'normal',
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()

        const systemCaps = useCababilityStore()

        // const EVENT_TYPE_MAPPING: Record<string, string> = {
        //     perimeter: Translate('IDCS_INVADE_DETECTION'),
        //     aoi_entry: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'),
        //     aoi_leave: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'),
        //     tripwire: Translate('IDCS_BEYOND_DETECTION'),
        //     pass_line: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
        //     region_statistics: Translate('IDCS_REGION_STATISTICS'),
        //     video_metavideo: Translate('IDCS_VSD_DETECTION'),
        //     face_detect: Translate('IDCS_FACE_DETECTION'),
        //     face_verify: Translate('IDCS_FACE_MATCH'),
        //     vehicle_plate: Translate('IDCS_PLATE_MATCH'), // 车牌事件，默认展示为：车牌识别-
        //     pvd: Translate('IDCS_PARKING_DETECTION'),
        //     fire_detection: Translate('IDCS_FIRE_POINT_DETECTION'),
        //     crowd_gather: Translate('IDCS_CROWD_GATHERING'),
        //     loitering: Translate('IDCS_LOITERING_DETECTION'),
        // }

        // const TARGET_TYPE_MAPPING: Record<string, string> = {
        //     person: Translate('IDCS_DETECTION_PERSON'),
        //     vehicle: Translate('IDCS_DETECTION_VEHICLE'),
        //     non_vehicle: Translate('IDCS_NON_VEHICLE'),
        //     face: Translate('IDCS_FACE'),
        //     firepoint: Translate('IDCS_FIRE_POINT'),
        //     vehicle_plate: Translate('IDCS_LICENSE_PLATE_NUM'),
        // }

        // const PLATE_EVENT_TARGET_TYPE_MAPPING: Record<string, string> = {
        //     0: '--',
        //     1: Translate('IDCS_DETECTION_VEHICLE'),
        //     2: Translate('IDCS_NON_VEHICLE'),
        // }

        // const COMPARE_STATUS_MAPPING: Record<string, string> = {
        //     1: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
        //     3: Translate('IDCS_STRANGE_PLATE'),
        //     4: Translate('IDCS_GROUP_STRANGER'),
        //     6: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
        // }

        const SEX_MAPPING: Record<string, string> = {
            male: Translate('IDCS_MALE'),
            female: Translate('IDCS_FEMALE'),
        }

        // const snapTargetMap = {
        //     person: 'person_info',
        //     vehicle: 'car_info',
        //     vehicle_plate: 'info',
        //     non_vehicle: 'bike_info',
        // }

        const listData = ref<WebsocketSnapOnSuccessSnap[]>([])

        const pageData = ref({
            isCompare: false,
            index: 0,
            type: 'faceCompare',
        })

        // NTA1-3779彻底将人脸识别成功和其他事件分开，从对比图进入需要过滤掉其他事件；从人脸识别成功的原图进入，无需过滤，但无法切换到对比图

        const open = () => {
            const current = prop.list[prop.index]

            if (current.type === 'face_verify' && prop.openType === 'faceCompare') {
                pageData.value.isCompare = true
                listData.value = prop.list.filter((item) => {
                    return item.type === 'face_verify'
                })
                pageData.value.index = prop.list.findIndex((item) => {
                    return item.info!.face_id === current.info!.face_id && item.detect_time === current.detect_time && item.info!.face_respo_id === current.info!.face_respo_id
                })
            } else {
                listData.value = cloneDeep(prop.list)
                pageData.value.index = prop.index
                pageData.value.isCompare = false
            }
        }

        const current = computed(() => {
            return listData.value[pageData.value.index]
        })

        // 双目热成像ipc显示热成像原图，可切换查看可见光原图
        // 单目热成像ipc只显示热成像原图，不显示可见光原图
        const isThermalDouble = computed(() => {
            return current.value.optical_scene_pic && current.value.thermal_scene_pic
        })

        const isRegisterBtn = computed(() => {
            return (
                (systemCaps.supportFaceMatch && current.value.type === 'face_detect') ||
                (pageData.value.type === 'facePanorama' && current.value.type === 'face_verify') ||
                (systemCaps.supportPlateMatch && current.value.type === 'vehicle_plate' && current.value.info!.compare_status !== 1)
            )
        })

        const displayDate = (date: string) => {
            if (!date) return ''
            return formatDate(date, DEFAULT_YMD_FORMAT)
        }

        const displayGender = (str: string) => {
            if (!str) return ''
            return SEX_MAPPING[str]
        }

        const displayImg = (str: string) => {
            if (!str) return ''
            return wrapBase64Img(str)
        }

        const displayPlateColor = () => {}

        const displayVehicleColor = () => {}

        const displayVehicleType = () => {}

        const displayBrand = () => {}

        return {
            current,
            pageData,
            displayDate,
            displayGender,
            displayImg,
            systemCaps,
            isRegisterBtn,
            displayPlateColor,
            displayVehicleColor,
            displayVehicleType,
            displayBrand,
            open,
            isThermalDouble,
        }
    },
})
</script>
