/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 17:20:48
 * @Description:
 */
import type { SetupContext } from 'vue'
import BaseImgSprite from '@/views/UI_PUBLIC/components/sprite/BaseImgSprite.vue'

export default defineComponent({
    components: {
        BaseImgSprite,
    },
    props: {
        notifications: {
            type: Array<string>,
            default: () => [],
        },
        duration: {
            type: Number,
            default: 100000,
        },
        position: {
            type: String,
            default: 'right-bottom',
        },
    },
    setup(props: any, { emit }: SetupContext) {
        const notifications = computed(() => props.notifications)
        const notificationList = ref(notifications.value)
        const duration = ref(props.duration)
        const hiddenNotify = ref<boolean>(true)
        const selectedNotificationIndex = ref(0)
        let timer: NodeJS.Timeout | null

        watch(
            () => notifications,
            (val) => {
                notificationList.value = val.value
                if (notificationList.value.length !== 0) {
                    nextTick(() => {
                        hiddenNotify.value = false
                        timeOutNotification()
                    })
                }
            },
            {
                deep: true,
                immediate: true,
            },
        )

        const containerClass = computed(() => `position-${props.position}`)

        const timeOutNotification = () => {
            if (timer !== null) {
                clearTimeout(timer)
                timer = null
            }
            timer = setTimeout(() => {
                removeNotification()
            }, duration.value)
        }

        const removeNotification = () => {
            notificationList.value = []
            hiddenNotify.value = true
            emit('update:notifications', [])
        }

        return {
            notificationList,
            removeNotification,
            hiddenNotify,
            containerClass,
            selectedNotificationIndex,
        }
    },
})
