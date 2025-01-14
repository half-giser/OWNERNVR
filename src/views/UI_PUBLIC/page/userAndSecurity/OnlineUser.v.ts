/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:42:30
 * @Description: 在线用户
 */
import type { UserOnlineList } from '@/types/apiType/userAndSecurity'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            // 是否打开的详情
            isDetail: false,
            // 选中的索引值
            detailIndex: 0,
        })

        // 登录状态与显示文本的映射
        const LOGIN_TYPE_MAPPING: Record<string, string> = {
            local: Translate('IDCS_LOCAL'),
            remote: Translate('IDCS_REMOTE'),
            rtsp: 'RTSP',
        }

        const tableData = ref<UserOnlineList[]>([])

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryOnlineUserInfo()

            closeLoading()
            commLoadResponseHandler(result, ($) => {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        userName: $item('userName').text(),
                        loginType: LOGIN_TYPE_MAPPING[$item('loginType').text()],
                        ip: $item('ip').text(),
                        time: utcToLocal($item('time').text(), dateTime.dateTimeFormat),
                        previewChlCount: $item('previewChlCount').text(),
                        playbackChlCount: $item('playbackChlCount').text(),
                    }
                })
            })
        }

        /**
         * @description 打开详情弹窗
         * @param {number} index
         */
        const showDetailInfo = (index: number) => {
            pageData.value.detailIndex = index
            pageData.value.isDetail = true
        }

        // 当前选中的用户
        const currentUser = computed(() => {
            const item = tableData.value[pageData.value.detailIndex]
            if (item) return item
            else return null
        })

        onMounted(() => {
            getData()
        })

        return {
            tableData,
            currentUser,
            showDetailInfo,
            pageData,
        }
    },
})
