interface TransRespToObjRule {
    from: Array<string>,
    to: Array<string>,
}
export class TransObj {
    private transRule: TransRespToObjRule;
    constructor(transRule: TransRespToObjRule) {
        this.transRule = transRule
    }
    public fromResp2Obj(source: any) {
        return this.format(source, "r2o")
    }
    public fromObj2Resp(source: any) {
        return this.format(source, "o2r")
    }
    public format(source: any, type="r2o"):any {
        try {
            let result = {}
            let fromArr = this.transRule.from
            let toArr = this.transRule.to
            if (type === 'o2r') {
                fromArr = this.transRule.to
                toArr = this.transRule.from
            }
            let fromKey;
            let sourceData;
            for (let i = 0; i < fromArr.length; i++) {
                fromKey = fromArr[i]
                sourceData = source[fromKey]
                if (source !== undefined && source !== null) {
                    result[toArr[i]] = sourceData
                } else {
                    console.warn(`You provided key ${fromKey} can't found in response data.`)
                }
            }
            return result
        } catch (e) {
            console.error("format response error!")
            throw Error(e.message ? e.message : "format error")
        }
    }
}

export const AllIssueTrans = new TransObj({
    from: ["comments", "number", "body", "title"],
    to: ["total", "id", "info", "name"],
})

export const CommentTrans = new TransObj({
    from: ["id", "updated_at", "body", "number"],
    to: ["id", "updated_at", "data", "number"],
})
