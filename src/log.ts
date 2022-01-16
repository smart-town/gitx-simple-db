const LEVEL_LIST = <const>['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

const LOG_STYLE = {
    "TRACE": "color: #CCCC99;",
    "DEBUG": "color: #99CC00;",
    "INFO": "color: #339933;",
    "WARN": "color: #FF9900;",
    "ERROR": "color: #990033;",
}
export class Log {
    private static PRE = 'LOG';
    public static LEVEL_G = null;
    public static log(...messages) {
        console.log(`%c[${Log.PRE}]`, "color: green;", ...messages)
    }

    private prefix:string = ''
    private level:number;
    constructor(prefix:string, level:  typeof LEVEL_LIST[number]) {
        this.prefix = prefix
        this.level = LEVEL_LIST.indexOf(level)
    }
    private printLog(type, ...messages) {
        // 全局标志覆盖子类的日志等级标志
        if (Log.LEVEL_G !== null) this.level = Log.LEVEL_G
        // console.log(`cmp: ${this.level} ${LEVEL_LIST.indexOf(type)}`)
        if (LEVEL_LIST.indexOf(type) < this.level) return;
        // console.log.apply(console, messages)
        console.log(`%c[${this.prefix}]`, LOG_STYLE[type], ...messages)
    }
    public trace(...messages) {
        this.printLog("TRACE", ...messages)
    }
    public debug(...messages) {
        this.printLog("DEBUG", ...messages)
    }
    public info(...messages) {
        this.printLog("INFO", ...messages)
    }
    public warn(...messages) {
        this.printLog("WARN", ...messages)
    }
    public error(...messages) {
        this.printLog("ERROR", ...messages)
    }
    public test() {
        this.trace("trace")
        this.debug("debug")
        this.info("info")
        this.warn("warn")
        this.error("error")
    }
}


