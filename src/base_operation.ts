import { GlobalData } from "./data";
import { Log } from "./log";
import DefaultFetch from "./net/fetchWrapper";
import AppSettings, { AppSettingsOption } from "./settings";

const logger = new Log("base_operation", "TRACE")
export interface GitXOption {
    newForce?: boolean,
    index?: number,
    option?: AppSettingsOption,
}

const defaultOption ={
    newForce: false,
    index: 0
}
class GitXSimpleDB {
    public static instances:Array<GitXSimpleDB> = []
    public static getInstance(option?:GitXOption) {
        return GitXSimpleDB.getInstanceByConstructor(option, GitXSimpleDB)
    }
    public static getInstanceByConstructor(option:GitXOption, ConstructorFunc) {
        option = {...defaultOption, ...option}
        if (option.newForce) {
            let instance = new ConstructorFunc(option.option)
            return instance
        }

        let len = ConstructorFunc.instances.length
        if (len) {
            if (len - 1 >= option.index) {
                return ConstructorFunc.instances[option.index]
            } else {
                throw Error(`current only ${len} instances`)
            }
        } else {
            let instance = new ConstructorFunc(option.option)
            return instance
        }

    }

    protected options: AppSettings;
    public global: GlobalData;
    public fetch: DefaultFetch;

    protected constructor(options: AppSettingsOption) {
        this.options = new AppSettings(options)
        this.fetch = new DefaultFetch(this.options)
        this.global = new GlobalData()
        GitXSimpleDB.instances.push(this)
    }
}
export default GitXSimpleDB