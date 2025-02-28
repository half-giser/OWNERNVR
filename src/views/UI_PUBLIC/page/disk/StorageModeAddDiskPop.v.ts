/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 18:02:05
 * @Description: 存储模式新增磁盘弹窗
 */
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
         * @property 备份磁盘ID列表
         */
        backupDiskId: {
            type: Array as PropType<string[]>,
            required: true,
            default: () => [],
        },
    },
    emits: {
        close() {
            return true
        },
        comfirm() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate, langId } = useLangStore()

        const tableData = ref<StorageModeDiskList[]>([])
        const pageData = ref({
            selection: [] as StorageModeDiskList[],
        })

        /**
         * @description 请求磁盘数据
         */
        const getData = async () => {
            const result = await queryDiskStatus()
            const $ = queryXml(result)

            const sendXml = rawXml`
                <condition>
                    <langId>${langId}</langId>
                </condition>
            `
            const disk = await queryLogicalDiskList(sendXml)
            const $disk = queryXml(disk)

            tableData.value = []

            if ($('status').text() === 'success') {
                $disk('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const diskId = item.attr('id')
                    const diskStatus = $(`content/item[@id="${diskId}"]/diskStatus`).text()
                    const diskInterfaceType = $item('diskInterfaceType').text()
                    const diskType = $item('diskType').text()
                    const diskList = prop.current.diskList.map((item) => item.id)
                    const diskName = $item('name').text()
                    if (!diskList.includes(diskId) && diskStatus === 'read/write' && !prop.backupDiskId.includes(diskId)) {
                        // 非备份组磁盘
                        tableData.value.push({
                            id: diskId,
                            name: diskInterfaceType === 'esata' ? Translate('IDCS_ESATA') + diskName : diskType === 'raid' ? diskName : Translate('IDCS_DISK') + diskName,
                            size: Math.floor($item('size').text().num() / 1024),
                        })
                    }
                })
            }
        }

        /**
         * @description 打开弹窗时 请求磁盘数据
         */
        const open = () => {
            getData()
        }

        /**
         * @description 更新选中的磁盘列表
         * @param {Array} value
         */
        const changeSelection = (value: StorageModeDiskList[]) => {
            pageData.value.selection = value
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 验证表单，更新磁盘组的磁盘数据
         */
        const confirm = () => {
            if (!pageData.value.selection.length) {
                openMessageBox(Translate('IDCS_PLEASE_SELECT_DISK'))
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_HD_CHANGE_GROUP_WARNING'),
            }).then(async () => {
                openLoading()

                const sendXml = rawXml`
                   <types>
                        <actionType>
                            <enum>add</enum>
                            <enum>remove</enum>
                        </actionType>
                    </types>
                    <content>
                        <diskGroup>
                            <action type="actionType">add</action>
                            <id>${prop.current.id}</id>
                            <disks type="list">${pageData.value.selection.map((item) => `<item id="${item.id}"></item>`).join('')}</disks>
                        </diskGroup>
                    </content>
                `
                const result = await editSetAndElementRelation(sendXml)
                const $ = queryXml(result)

                if ($('status').text() === 'success') {
                    ctx.emit('comfirm')
                }

                closeLoading()
            })
        }

        return {
            open,
            tableData,
            pageData,
            changeSelection,
            close,
            confirm,
        }
    },
})
