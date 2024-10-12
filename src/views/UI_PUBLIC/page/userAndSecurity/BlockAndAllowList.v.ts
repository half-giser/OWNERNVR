/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:42:59
 * @Description: 黑白名单
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 14:01:56
 */
import BlockAndAllowEditPop from './BlockAndAllowEditPop.vue'
import { UserBlackAllowListForm, UserEditBlackAllowListForm } from '@/types/apiType/userAndSecurity'

export default defineComponent({
    components: {
        BlockAndAllowEditPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageTipBox } = useMessageBox()

        const pageData = ref({
            // 是否显示编辑弹窗
            isEditPop: false,
            // 编辑项的索引. -1为新增
            editIndex: -1,
            // 编辑数据
            editData: new UserEditBlackAllowListForm(),
            // 是否禁用提交表单按钮
            submitDisabled: true,
            mounted: false,
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
        const handleEdit = (row: UserEditBlackAllowListForm, index: number) => {
            pageData.value.isEditPop = true
            pageData.value.editIndex = index
            pageData.value.editData = { ...row }
        }

        /**
         * @description 删除表单行
         * @param {number} index
         */
        const handleDelete = (index: number) => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                tableData.value.splice(index, 1)
            })
        }

        /**
         * @description 添加IP，打开编辑弹窗
         */
        const handleAddIp = () => {
            pageData.value.isEditPop = true
            pageData.value.editIndex = -1
            const editData = new UserEditBlackAllowListForm()
            editData.addressType = 'ip'
            pageData.value.editData = editData
        }

        /**
         * @description 添加MAC，打开编辑弹窗
         */
        const handleAddMac = () => {
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
        const handleConfirmEdit = (e: UserEditBlackAllowListForm | null) => {
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
                formData.value.switch = $('//content/switch').text().toBoolean()
                formData.value.filterType = $('//content/filterType').text() as UserBlackAllowListForm['filterType']
                tableData.value = []
                $('//content/filterList/itemType/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    tableData.value.push({
                        switch: $item('switch').text().toBoolean(),
                        addressType: $item('addressType').text() as UserEditBlackAllowListForm['addressType'],
                        ip: $item('ip').text() || '',
                        startIp: $item('startIp').text() || '',
                        endIp: $item('endIp').text() || '',
                        mac: $item('mac').text() || '',
                    })
                })
                nextTick(() => {
                    pageData.value.mounted = true
                })
            })
        }

        const stopFormDataWatch = watch(
            formData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.submitDisabled = false
                    stopFormDataWatch()
                    stopTableDataWatch()
                }
            },
            {
                deep: true,
            },
        )

        const stopTableDataWatch = watch(
            tableData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.submitDisabled = false
                    stopFormDataWatch()
                    stopTableDataWatch()
                }
            },
            {
                deep: true,
            },
        )

        /**
         * @description 保存数据
         */
        const setData = async () => {
            openLoading()

            const tableXml = tableData.value
                .map((item) => {
                    return rawXml`
                        <item>
                            <switch>${String(item.switch)}</switch>
                            <addressType>${item.addressType}</addressType>
                            ${item.addressType === 'ip' ? `<ip>${item.ip}</ip>` : ''}
                            ${item.addressType === 'mac' ? `<mac>${item.mac}</mac>` : ''}
                            ${item.addressType === 'iprange' ? `<startIp>${item.startIp}</startIp><endIp>${item.endIp}</endIp>` : ''}
                        </item>
                    `
                })
                .join('')
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
                    <switch>${String(formData.value.switch)}</switch>
                    <filterType type="filterTypeMode">${formData.value.filterType}</filterType>
                    <filterList type="list">
                        <itemType>
                            <addressType type="addressType" />
                            ${tableXml}
                        </itemType>
                    </filterList>
                </content>
            `
            const result = await editBlackAndWhiteList(sendXml)

            closeLoading()
            commSaveResponseHadler(result, () => {
                pageData.value.submitDisabled = true
            })
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

        onMounted(() => {
            getData()
        })

        return {
            formData,
            tableData,
            pageData,
            handleEdit,
            handleDelete,
            handleAddIp,
            handleAddMac,
            formatIpMacAddress,
            setData,
            handleConfirmEdit,
            BlockAndAllowEditPop,
        }
    },
})
