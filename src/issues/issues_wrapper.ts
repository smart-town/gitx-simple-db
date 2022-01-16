import { isPlainObject } from "is-plain-object";
import GitXSimpleDB, { GitXOption } from "../base_operation";
import { FeatOption } from "../net/fetchWrapper";
import { AllIssueTrans } from "./issue_resp_format";
import { Issue, Table } from "./issue_type";

function transBody(data) {
    if (data.body) {
        try {
            let bodyObj = JSON.parse(data.body)
            data.body = bodyObj
        } catch (e) {
            // console.warn("transform body to json fail")
        }
    }
    return data;
}

export class IssueWrapper extends GitXSimpleDB {
    public static getInstance(option?: GitXOption):IssueWrapper {
        return GitXSimpleDB.getInstanceByConstructor(option, IssueWrapper)
    }
    public preCommonDeal(resp:any):any{
        if (Array.isArray(resp)) {
            resp.forEach(item => {
                transBody(item)
            })
        } else if (isPlainObject(resp)) {
            transBody(resp)
        }
        return resp
    }
    public async doRequest(apiName:string, data?: any, urlVar:Record<string, any> = undefined, feat?:FeatOption) {
        let resp = await this.fetch.request(apiName, data, urlVar, feat)
        return this.preCommonDeal(resp)
    }
    // TODO 当前仅能查到 100 个 issue，后面加一个分页吧
    public async allTables() {
        let resp = await this.doRequest("all", {state: 'all', per_page: 100,})
        let tables = []
        for(let table of resp) {
            tables.push(table)
        }

        let tableGlobal = {}
        tables.forEach(table => {tableGlobal[table.title] = table})
        this.global.tables = tableGlobal

        return tables
    }

    public async getTable(tableName:string) {
        let tableInfo = await this.getTableInfo(tableName)
        let resp = await this.doRequest("one", undefined, {number: tableInfo.number,})
        return resp
    }
    public async getTableInfo(tableName:string, retry:number=1) {
        if (this.global.tables && Object.keys(this.global.tables).length) {
            if (tableName in this.global.tables) {
                return this.global.tables[tableName]
            } else {
                if (retry >= 0) {
                    // console.warn("retry get all tables.")
                    this.global.tables = null
                } else {
                    throw Error("Can not find "+tableName)
                }
            }
        }
        await this.allTables()
        return await this.getTableInfo(tableName, retry-1)
    }

    public async createTable(name: string, info?: string) {
        let requestOption = AllIssueTrans.fromObj2Resp({
            name,
            info,
        })
        let resp = await this.doRequest("create", {...requestOption, repo: this.options.repo})
        return resp
    }
    
    public async updateTable(name: string, data: any) {
        let tableInfo:Issue = await this.getTableInfo(name)
        let number = tableInfo.number
        let resp = await this.doRequest("update", {repo: this.options.repo, owner: this.options.owner, number, body: data})
        return resp
    }
    public async deleteTable(data:Table) {
        throw Error("Current sames not support. may only closed?")
    }
    public async queryDataByPage(tableName:string, page: number=1, per_page: number=100, queryOption:any={ order: 'desc'}) {
        let tableInfo:Issue = await this.getTableInfo(tableName)
        let id = tableInfo.number
        let queryParam = {
            ...queryOption,
            page,
            per_page,
        }
        let data = await this.doRequest("repoAllComments", queryParam, {number:id})
        return data
    }
    public async queryAllData(tableName:string, page=1, queryOption:any={order: 'desc'}) {
        let latestInfo = await this.getTable(tableName)
        let total = latestInfo.comments
        if (!total) {
            return
        }
        let per_page = 1;
        let pageNum = Math.floor(total / per_page)
        let result = []
        for (let i = page; i <= pageNum; i++) {
            // console.log("prepare query page:" + page)
            result.push(await this.queryDataByPage(tableName, i, per_page, queryOption))
        }
        return result
    }
    public async addData(tableName:string, data) {
        let tableInfo:Issue = await this.getTableInfo(tableName)
        let id = tableInfo.number;
        let urlVar = {number: id}
        let requestData = {body: typeof data === 'string' ? data : JSON.stringify(data)}
        let resp = await this.doRequest("addComments", requestData, urlVar)
        return resp
    } 
    public async updateData(dataId: any, data) {
        let requestData = {body: typeof data === 'string' ? data : JSON.stringify(data), id: dataId};
        let resp = await this.doRequest("updateComments", requestData)
        return resp
    }
    public async deleteData(dataId: any) {
        let resp = await this.doRequest("delComments", {id: dataId})
        return resp
    }
}