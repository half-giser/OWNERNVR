/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2025-04-10 16:08:36
 * @Description: Web日志组件
 *
 * 使用方式：
 * const logger = useLogger('moduleName'.INFO); // 实例化日志对象，指定模块名和日志级别
 * logger.info('This is an info message'); // 输出日志信息
 *
 * 说明：
 * 1、 日志级别默认为 INFO 级别，但如果localStorage中有此模块的级别配置，则使用localStorage中的值，所以调试过程中可以通过修改localStorage中的值来动态改变日志级别，刷新后生效。
 * 2、 代码中可通过 setLogLevel 方法设置日志级别，或在控制台中通过 logger.setLogLevel(LOG_LEVELS.DEBUG) 来动态改变日志级别，这时无需刷新浏览器；
 * 3、 日志级别从低到高为： TRACE(0) DEBUG(1) INFO(2) WARN(3) ERROR(4)，对应的打印方法名为级别名称小写，日志组件仅打印大于等于自己配置级别的日志，即配置的级别越高，打印的日志越少；
 * 4、 日志信息格式为 [模块名(级别)][时间] 日志内容，时间格式为 YYYY-MM-DD HH:mm:ss SSS，其中 SSS 为毫秒；
 *
 * 日志级别使用约定：
 * 1、 TRACE 级别用于追踪某个特定执行流程细节，一般加大量的日志，很少使用；
 * 2、 DEBUG 级别用于调试，正常运行时不会打印，当需要调试某个模块相关的功能时，动态将此模块的日志级别调整成debug；
 * 3、 INFO 级别用于记录程序运行信息，可固定在控制台打印的信息，比如当前播放器运行模式，插件的版本号等；
 * 4、 WARN 级别用于记录程序运行警告信息，如代码执行到非预期位置，但当时并没有报错或产生异常，类似使用断言的地方打印；
 * 5、 ERROR 级别用于记录程序运行错误信息，比如try-catch接到异常等；
 */

// 定义 SLF4J 风格的日志级别常量
export const LOG_LEVELS = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
}

// 从 localStorage 获取日志配置
const getLogConfig = (): Record<string, number> => {
    const config = localStorage.getItem('webLogCfg')
    return config ? JSON.parse(config) : {}
}

// 更新 localStorage 中的日志配置
const setLogConfig = (config: Record<string, number>) => {
    localStorage.setItem('webLogCfg', JSON.stringify(config))
}

export const useLogger = (module: string) => {
    let logLevel = LOG_LEVELS.INFO

    const config = getLogConfig()
    if (typeof config[module] === 'number') {
        logLevel = config[module]
    } else {
        config[module] = logLevel
        setLogConfig(config)
    }

    const getCurrentTimeStr = () => {
        return formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss SSS')
    }

    return {
        setLogLevel(level: number) {
            const config = getLogConfig()
            config[module] = level
            logLevel = level
            setLogConfig(config)
        },

        trace(...args: any[]) {
            if (logLevel <= LOG_LEVELS.TRACE) {
                console.trace(`[${module}(T)][${getCurrentTimeStr()}]`, ...args)
            }
        },

        debug(...args: any[]) {
            if (logLevel <= LOG_LEVELS.DEBUG) {
                console.debug(`[${module}(D)][${getCurrentTimeStr()}]`, ...args)
            }
        },

        info(...args: any[]) {
            if (logLevel <= LOG_LEVELS.INFO) {
                console.info(`[${module}(I)][${getCurrentTimeStr()}]`, ...args)
            }
        },

        warn(...args: any[]) {
            if (logLevel <= LOG_LEVELS.WARN) {
                console.warn(`[${module}(W)][${getCurrentTimeStr()}]`, ...args)
            }
        },

        error(...args: any[]) {
            if (logLevel <= LOG_LEVELS.ERROR) {
                console.error(`[${module}(E)][${getCurrentTimeStr()}]`, ...args)
            }
        },
    }
}
