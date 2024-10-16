/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 18:01:51
 * @Description: 存储模式新增通道弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-14 17:44:26
 */
import { StorageModeDiskGroupList, type StorageModeChlList } from '@/types/apiType/disk'

export default defineComponent({
    props: {
        /**
         * @property 当前磁盘组
         */
        current: {
            type: Object as PropType<StorageModeDiskGroupList>,
            required: true,
            default: () => new StorageModeDiskGroupList(),
        },
        /**
         * @property 磁盘组列表
         */
        list: {
            type: Array as PropType<StorageModeDiskGroupList[]>,
            required: true,
            default: () => new StorageModeDiskGroupList(),
        },
    },
    emits: {
        close() {
            return true
        },
        confirm() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        const tableData = ref<StorageModeChlList[]>([])
        const pageData = ref({
            selection: [] as StorageModeChlList[],
        })

        const liveRef = ref<LivePopInstance>()

        /**
         * @description 获取通道列表数据
         */
        const getData = async () => {
            const sendXml = rawXml`
                <requireField>
                    <name/>
                    <ip/>
                    <chlIndex/>
                    <chlType/>
                </requireField>
            `
            const result = await queryDevList(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                const chlList = prop.current.chlList.map((item) => item.id)
                tableData.value = $('//content/item')
                    .filter((item) => !chlList.includes(item.attr('id')!))
                    .map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            id: item.attr('id')!,
                            name: $item('name').text(),
                            chlIndex: $item('chlIndex').text(),
                            chlType: $item('chlType').text(),
                            ip: $item('ip').text(),
                        }
                    })
            }
        }

        /**
         * @description 打开通道预览
         * @param {StorageModeChlList} rowData
         */
        const preview = (rowData: StorageModeChlList) => {
            liveRef.value?.openLiveWin(rowData.id, rowData.name, true)
        }

        /**
         * @description 打开弹窗时，请求通道列表数据
         */
        const open = () => {
            getData()
        }

        /**
         * @description 验证表单，更新磁盘组的通道数据
         */
        const confirm = async () => {
            if (!pageData.value.selection.length) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'),
                })
                return
            }

            openLoading()

            const selections = pageData.value.selection.map((item) => item.id)
            const needRemovechlsAndGroup: string[] = []
            prop.list.forEach((item) => {
                const list = item.chlList
                    .map((chl) => chl.id)
                    .filter((id) => selections.includes(id))
                    .map((id) => `<item id="${id}"></item>`)
                    .join('')
                if (list.length) {
                    needRemovechlsAndGroup.push(rawXml`
                        <diskGroup>
                            <action type="actionType">remove</action>
                            <id>${item.id}</id>
                            <chls type="list">${list}</chls>
                        </diskGroup>
                    `)
                }
            })

            const sendXml = rawXml`
                <types>
                    <actionType>
                        <enum>add</enum>
                        <enum>remove</enum>
                    </actionType>
                </types>
                <content>
                    ${needRemovechlsAndGroup.join('')}
                    <diskGroup>
                        <action type="actionType">add</action>
                        <id>${prop.current.id}</id>
                        <chls type="list">${selections.map((id) => `<item id="${id}" />`).join('')}</chls>
                    </diskGroup>
                </content>
            `
            const result = await editSetAndElementRelation(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                ctx.emit('confirm')
            }

            closeLoading()
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 更新选中的通道列表
         * @param {Array} value
         */
        const changeSelection = (value: StorageModeChlList[]) => {
            pageData.value.selection = value
        }

        return {
            liveRef,
            tableData,
            pageData,
            open,
            preview,
            confirm,
            close,
            changeSelection,
        }
    },
})
