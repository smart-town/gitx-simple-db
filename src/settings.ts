import ApiConsts, {issueApi} from './issues/consts'

interface GitXSimpleDBInitialOption {
    auth_token: string,
    repo: string,
    owner: string,
}
export interface AppSettingsOption {
    hostBase?: string,
    apiConsts?: Record<string, Array<string>>,
    authorizeType?: 'token' | undefined,
    access_token?: string,
    repo: string,
    owner: string,
}

export const defaultGiteeSetting:AppSettingsOption = {
    hostBase: 'https://gitee.com/api/v5',
    // apiConsts: issueApi,
    authorizeType: undefined,
    repo: 'gitx-simple-db',
    owner: 'lhhcherry',
}

export default class AppSettings {
    private option:AppSettingsOption;
    constructor(option:AppSettingsOption) {
        this.option = {...defaultGiteeSetting,...option};
        let supportedPlatforms = Object.keys(ApiConsts)
        for (let platform of supportedPlatforms) {
            if (this.option.hostBase.indexOf(platform) !== -1) {
                this.option.apiConsts = ApiConsts[platform]
                break
            }
        }
        if (!this.option.apiConsts) {
            throw Error(`Cant't find apiConsts config`)
        }
        // console.log("gene option:", this.option)
        // console.trace('appsetting option:', this.option)
    }
    get repo(): string {
        return this.option.repo
    }
    get owner(): string {
        return this.option.owner
    }
    get hostBase(): string {
        return this.option.hostBase
    }
    get apiConsts(): Record<string, Array<string>> {
        return this.option.apiConsts
    }
    get authorization(): string | undefined {
        if (!this.option.access_token) {
            return undefined;
        }
        if (!this.option.authorizeType) {
            return `token ${this.option.access_token}`
        } else {
            return `${this.option.authorizeType} ${this.option.access_token}`
        }
    }
}