import fetch, {RequestInit, Response} from 'node-fetch'
import {isPlainObject} from 'is-plain-object'
import AppSettings, { AppSettingsOption } from '../settings'

interface RequestOptions {
    body?: Object | string,
    method?: ['GET', 'POST', 'PATCH', 'DELETE', 'HEAD'],
    headers?: Object,
    redirect: string,
}

async function dealResponse(resp: Response) {
    const contentType = resp.headers.get("content-type")
    if (/application\/json/.test(contentType)) {
        return resp.json()
    }
    if (!contentType || /^test\/|charset=utf-8$/.test(contentType)) {
        return resp.text()
    }
    return resp.arrayBuffer()
}
function toErrorMessage(data: any) {
    if (typeof data === 'string') return data;
    if ("message" in data) {
        return data.message;
    }
    if ("messages" in data) {
        return data.messages
    }
    return `Unknown error: ${JSON.stringify(data)}`
}

export interface FeatOption {
    withHeader?: boolean,
}
export const fetchWrapper = async (url: string, options: RequestInit, feat: FeatOption={withHeader: false}): Promise<any> => {
    if (!options.method) {
        options.method = "GET"
    }
    if ("GET" === options.method && isPlainObject(options.body)){
        url = `${url}?${new URLSearchParams(<any>options.body).toString()}`
        delete options.body
    }
    if (isPlainObject(options.body) || Array.isArray(options.body)) {   
        // console.log("has transfered options.body, from ", options.body, " to", JSON.stringify(options.body))
        options.body = JSON.stringify(options.body)
    }
    if (["POST", "PATCH", "DELETE"].indexOf(options.method) !== -1) {
        if (options.headers && !options.headers["Content-Type"]) {
            options.headers["Content-Type"] = "application/json";
        }
    }
    

    // console.log("request:", url, options)
    let resp = await fetch(url, options);
    let status = resp.status;
    if (status >= 400) {
        const data = await dealResponse(resp);
        throw Error(toErrorMessage(data))
    }
    if (status === 204 || status === 205) {
        return
    }

    let data = await dealResponse(resp)
    if (feat.withHeader) {
        return {
            data,
            headers: resp.headers
        }
    } 
    return data
}

export class DefaultFetch {
    private appSettings:AppSettings;
    constructor(appSettings: AppSettings) {
        // console.log("default settings:", appSettings)
        this.appSettings = appSettings;
    }
    private setUrlVar(url, data, urlVar:Record<string, any>):string {
        let needKeys = url.match(/(\{[\w_]+\})/g)
        if (!needKeys) {
            return url
        }
        for (let keyPattern of needKeys) {
            let needKey = keyPattern.substr(1, keyPattern.length-2)
            // console.log(`deal about ${needKey} with ${url} - ${keyPattern}`)
            if (needKey in urlVar) {
                url = url.replace(keyPattern, urlVar[needKey])
            } else if(needKey in data) {
                url = url.replace(keyPattern, data[needKey])
            } else {
                throw Error(`not define var ${needKey} in ${url}`)
            }
        }
        return url
    }
    public async rawRequest(url:string, options: {headers?:any, method?:any, body?:any}={}, urlVar?: Record<string, any>) {
        url = this.setUrlVar(url, options.body, {...urlVar, repo: this.appSettings.repo, owner: this.appSettings.owner})
        options.headers = {...this.headerBase(), ...options.headers}
        return this.executeQuery(url, options)
    }
    public async request(apiName:string, data?:any, urlVar?: Record<string, any>, feat?:FeatOption) {
        let api = this.appSettings.apiConsts[apiName];
        if (!api) {
            throw Error(`Can not found api:${apiName}`)
        }
        let url = this.getUrl(api[0])
        let method = api[1]
        let options = {
            method,
            body: data,
            headers: this.headerBase(),
        }
        url = this.setUrlVar(url, data, {...urlVar, repo: this.appSettings.repo, owner: this.appSettings.owner})
        return this.executeQuery(url, options, feat)
    }
    private getUrl(api:string): string {
        return `${this.appSettings.hostBase}${api}`
    }
    private headerBase():Record<string, any> {
        return {
            "User-Agent": 'gitx-simple-db/request;',
            "Authorization": this.appSettings.authorization,
        }
    }
    private async executeQuery(url: string, options: any, feat?:FeatOption) {
        return fetchWrapper(url, options, feat)
    }
}

export default DefaultFetch