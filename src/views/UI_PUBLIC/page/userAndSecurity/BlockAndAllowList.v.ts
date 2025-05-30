/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:42:59
 * @Description: 黑白名单
 */
import BlockAndAllowEditPop from './BlockAndAllowEditPop.vue'

export default defineComponent({
    components: {
        BlockAndAllowEditPop,
    },
    setup() {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 是否显示编辑弹窗
            isEditPop: false,
            // 编辑项的索引. -1为新增
            editIndex: -1,
            // 编辑数据
            editData: new UserEditBlackAllowListForm(),
        })

        // 表单数据
        const formData = ref(new UserBlackAllowListForm())
        // 表格数据
        const tableData = ref<UserEditBlackAllowListForm[]>([])

        /**
         * @description 编辑数据，打开编辑弹窗
         * @param {UserBlackAllowList} row
         * @param {number} index
         */
        const openEditPop = (row: UserEditBlackAllowListForm, index: number) => {
            pageData.value.isEditPop = true
            pageData.value.editIndex = index
            pageData.value.editData = { ...row }
        }

        /**
         * @description 删除表单行
         * @param {number} index
         */
        const delItem = (index: number) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                tableData.value.splice(index, 1)
            })
        }

        /**
         * @description 添加IP，打开编辑弹窗
         */
        const addIp = () => {
            pageData.value.isEditPop = true
            pageData.value.editIndex = -1
            const editData = new UserEditBlackAllowListForm()
            editData.addressType = 'ip'
            pageData.value.editData = editData
        }

        /**
         * @description 添加MAC，打开编辑弹窗
         */
        const addMac = () => {
            pageData.value.isEditPop = true
            pageData.value.editIndex = -1
            const editData = new UserEditBlackAllowListForm()
            editData.addressType = 'mac'
            pageData.value.editData = editData
        }

        /**
         * @description 关闭编辑弹窗，更新表格数据
         * @param {UserEditBlackAllowListForm} e
         */
        const confirmEditItem = (e: UserEditBlackAllowListForm | null) => {
            if (e) {
                if (pageData.value.editIndex === -1) {
                    tableData.value.push({ ...e })
                } else {
                    tableData.value[pageData.value.editIndex] = { ...e }
                }
            }
            pageData.value.isEditPop = false
        }

        /**
         * @description 请求表单和表格数据
         */
        const getData = async () => {
            const result = await queryBlackAndWhiteList()
            commLoadResponseHandler(result, ($) => {
                formData.value.switch = $('content/switch').text().bool()
                formData.value.filterType = $('content/filterType').text()
                tableData.value = $('content/filterList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        switch: $item('switch').text().bool(),
                        addressType: $item('addressType').text(),
                        ip: $item('ip').text(),
                        startIp: $item('startIp').text(),
                        endIp: $item('endIp').text(),
                        mac: $item('mac').text(),
                    }
                })
            })
        }

        /**
         * @description 保存数据
         */
        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <types>
                    <filterTypeMode>
                        <enum>refuse</enum>
                        <enum>allow</enum>
                    </filterTypeMode>
                    <addressType>
                        <enum>ip</enum>
                        <enum>iprange</enum>
                        <enum>mac</enum>
                    </addressType>
                </types>
                <content>
                    <switch>${formData.value.switch}</switch>
                    <filterType type="filterTypeMode">${formData.value.filterType}</filterType>
                    <filterList type="list">
                        <itemType>
                            <addressType type="addressType" />
                        </itemType>
                        ${tableData.value
                            .map((item) => {
                                return rawXml`
                                    <item>
                                        <switch>${item.switch}</switch>
                                        <addressType>${item.addressType}</addressType>
                                        ${item.addressType === 'ip' ? `<ip>${item.ip}</ip>` : ''}
                                        ${item.addressType === 'mac' ? `<mac>${item.mac}</mac>` : ''}
                                        ${item.addressType === 'iprange' ? `<startIp>${item.startIp}</startIp><endIp>${item.endIp}</endIp>` : ''}
                                    </item>
                                `
                            })
                            .join('')}
                    </filterList>
                </content>
            `
            const result = await editBlackAndWhiteList(sendXml)

            closeLoading()
            commSaveResponseHandler(result)
        }

        /**
         * @description 对表格IP和MAC项的格式化显示
         * @param {UserBlackAllowList} row
         */
        const formatIpMacAddress = (row: UserEditBlackAllowListForm) => {
            switch (row.addressType) {
                case 'iprange':
                    return `${row.startIp}~${row.endIp}`
                case 'ip':
                    return row.ip
                case 'mac':
                default:
                    return row.mac
            }
        }

        onMounted(async () => {
            openLoading()
            await getData()
            closeLoading()
        })

        return {
            formData,
            tableData,
            pageData,
            openEditPop,
            delItem,
            addIp,
            addMac,
            formatIpMacAddress,
            setData,
            confirmEditItem,
        }
    },
})
