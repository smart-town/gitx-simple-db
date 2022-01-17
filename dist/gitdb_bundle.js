var gitdb = (function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /*!
     * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */

    function isObject(o) {
      return Object.prototype.toString.call(o) === '[object Object]';
    }

    function isPlainObject(o) {
      var ctor,prot;

      if (isObject(o) === false) return false;

      // If has modified constructor
      ctor = o.constructor;
      if (ctor === undefined) return true;

      // If has modified prototype
      prot = ctor.prototype;
      if (isObject(prot) === false) return false;

      // If constructor does not have an Object-specific method
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      // Most likely a plain Object
      return true;
    }

    class GlobalData {
        set tables(tables) {
            this._tables = tables;
        }
        get tables() {
            return this._tables;
        }
    }

    var browser = {exports: {}};

    (function (module, exports) {

    // ref: https://github.com/tc39/proposal-global
    var getGlobal = function () {
    	// the only reliable means to get the global object is
    	// `Function('return this')()`
    	// However, this causes CSP violations in Chrome apps.
    	if (typeof self !== 'undefined') { return self; }
    	if (typeof window !== 'undefined') { return window; }
    	if (typeof global !== 'undefined') { return global; }
    	throw new Error('unable to locate global object');
    };

    var global = getGlobal();

    module.exports = exports = global.fetch;

    // Needed for TypeScript and Webpack.
    if (global.fetch) {
    	exports.default = global.fetch.bind(global);
    }

    exports.Headers = global.Headers;
    exports.Request = global.Request;
    exports.Response = global.Response;
    }(browser, browser.exports));

    var fetch = browser.exports;

    function dealResponse(resp) {
        return __awaiter(this, void 0, void 0, function* () {
            const contentType = resp.headers.get("content-type");
            if (/application\/json/.test(contentType)) {
                return resp.json();
            }
            if (!contentType || /^test\/|charset=utf-8$/.test(contentType)) {
                return resp.text();
            }
            return resp.arrayBuffer();
        });
    }
    function toErrorMessage(data) {
        if (typeof data === 'string')
            return data;
        if ("message" in data) {
            return data.message;
        }
        if ("messages" in data) {
            return data.messages;
        }
        return `Unknown error: ${JSON.stringify(data)}`;
    }
    const fetchWrapper = (url, options, feat = { withHeader: false, fresh: true }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!options.method) {
            options.method = "GET";
        }
        if ("GET" === options.method && isPlainObject(options.body)) {
            if (feat.fresh) {
                options.body['GITXRANDOM'] = new Date().getTime();
            }
            url = `${url}?${new URLSearchParams(options.body).toString()}`;
            delete options.body;
        }
        if (isPlainObject(options.body) || Array.isArray(options.body)) {
            // console.log("has transfered options.body, from ", options.body, " to", JSON.stringify(options.body))
            options.body = JSON.stringify(options.body);
        }
        if (["POST", "PATCH", "DELETE"].indexOf(options.method) !== -1) {
            if (options.headers && !options.headers["Content-Type"]) {
                options.headers["Content-Type"] = "application/json";
            }
        }
        // console.log("request:", url, options)
        let resp = yield fetch(url, options);
        let status = resp.status;
        if (status >= 400) {
            const data = yield dealResponse(resp);
            throw Error(toErrorMessage(data));
        }
        if (status === 204 || status === 205) {
            return;
        }
        let data = yield dealResponse(resp);
        if (feat.withHeader) {
            return {
                data,
                headers: resp.headers
            };
        }
        return data;
    });
    class DefaultFetch {
        constructor(appSettings) {
            // console.log("default settings:", appSettings)
            this.appSettings = appSettings;
        }
        setUrlVar(url, data, urlVar) {
            let needKeys = url.match(/(\{[\w_]+\})/g);
            if (!needKeys) {
                return url;
            }
            for (let keyPattern of needKeys) {
                let needKey = keyPattern.substr(1, keyPattern.length - 2);
                // console.log(`deal about ${needKey} with ${url} - ${keyPattern}`)
                if (needKey in urlVar) {
                    url = url.replace(keyPattern, urlVar[needKey]);
                }
                else if (needKey in data) {
                    url = url.replace(keyPattern, data[needKey]);
                }
                else {
                    throw Error(`not define var ${needKey} in ${url}`);
                }
            }
            return url;
        }
        rawRequest(url, options = {}, urlVar) {
            return __awaiter(this, void 0, void 0, function* () {
                url = this.setUrlVar(url, options.body, Object.assign(Object.assign({}, urlVar), { repo: this.appSettings.repo, owner: this.appSettings.owner }));
                options.headers = Object.assign(Object.assign({}, this.headerBase()), options.headers);
                return this.executeQuery(url, options);
            });
        }
        request(apiName, data, urlVar, feat) {
            return __awaiter(this, void 0, void 0, function* () {
                let api = this.appSettings.apiConsts[apiName];
                if (!api) {
                    throw Error(`Can not found api:${apiName}`);
                }
                let url = this.getUrl(api[0]);
                let method = api[1];
                let options = {
                    method,
                    body: data,
                    headers: this.headerBase(),
                };
                url = this.setUrlVar(url, data, Object.assign(Object.assign({}, urlVar), { repo: this.appSettings.repo, owner: this.appSettings.owner }));
                return this.executeQuery(url, options, feat);
            });
        }
        getUrl(api) {
            return `${this.appSettings.hostBase}${api}`;
        }
        headerBase() {
            return {
                "User-Agent": 'gitx-simple-db/request;',
                "Authorization": this.appSettings.authorization,
            };
        }
        executeQuery(url, options, feat) {
            return __awaiter(this, void 0, void 0, function* () {
                return fetchWrapper(url, options, feat);
            });
        }
    }

    const issueApi = {
        "all": ["/repos/{owner}/{repo}/issues", "GET"],
        "one": ["/repos/{owner}/{repo}/issues/{number}", "GET"],
        "create": ["/repos/{owner}/issues", "POST"],
        "update": ["/repos/{owner}/issues/{number}", "PATCH"],
        "repoAllComments": ["/repos/{owner}/{repo}/issues/{number}/comments", "GET"],
        "addComments": ["/repos/{owner}/{repo}/issues/{number}/comments", "POST"],
        "getComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "GET"],
        "updateComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "PATCH"],
        "delComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "DELETE"],
        "getOwnComments": ["/issues", "GET"],
    };
    const githubIssueApi = {
        "all": ["/repos/{owner}/{repo}/issues", "GET"],
        "one": ["/repos/{owner}/{repo}/issues/{number}", "GET"],
        "create": ["/repos/{owner}/{repo}/issues", "POST"],
        "update": ["/repos/{owner}/{repo}/issues/{number}", "PATCH"],
        "repoAllComments": ["/repos/{owner}/{repo}/issues/{number}/comments", "GET"],
        "addComments": ["/repos/{owner}/{repo}/issues/{number}/comments", "POST"],
        "getComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "GET"],
        "updateComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "PATCH"],
        "delComments": ["/repos/{owner}/{repo}/issues/comments/{id}", "DELETE"],
        "getOwnComments": ["/user/issues", "GET"],
    };
    const ApiConsts = {
        gitee: issueApi,
        github: githubIssueApi,
    };

    const defaultGiteeSetting = {
        hostBase: 'https://gitee.com/api/v5',
        // apiConsts: issueApi,
        authorizeType: undefined,
        repo: 'gitx-simple-db',
        owner: 'lhhcherry',
    };
    class AppSettings {
        constructor(option) {
            this.option = Object.assign(Object.assign({}, defaultGiteeSetting), option);
            let supportedPlatforms = Object.keys(ApiConsts);
            for (let platform of supportedPlatforms) {
                if (this.option.hostBase.indexOf(platform) !== -1) {
                    this.option.apiConsts = ApiConsts[platform];
                    break;
                }
            }
            if (!this.option.apiConsts) {
                throw Error(`Cant't find apiConsts config`);
            }
            // console.log("gene option:", this.option)
            // console.trace('appsetting option:', this.option)
        }
        get repo() {
            return this.option.repo;
        }
        get owner() {
            return this.option.owner;
        }
        get hostBase() {
            return this.option.hostBase;
        }
        get apiConsts() {
            return this.option.apiConsts;
        }
        get authorization() {
            if (!this.option.access_token) {
                return undefined;
            }
            if (!this.option.authorizeType) {
                return `token ${this.option.access_token}`;
            }
            else {
                return `${this.option.authorizeType} ${this.option.access_token}`;
            }
        }
    }

    const defaultOption = {
        newForce: false,
        index: 0
    };
    class GitXSimpleDB {
        constructor(options) {
            this.options = new AppSettings(options);
            this.fetch = new DefaultFetch(this.options);
            this.global = new GlobalData();
            GitXSimpleDB.instances.push(this);
        }
        static getInstance(option) {
            return GitXSimpleDB.getInstanceByConstructor(option, GitXSimpleDB);
        }
        static getInstanceByConstructor(option, ConstructorFunc) {
            option = Object.assign(Object.assign({}, defaultOption), option);
            if (option.newForce) {
                let instance = new ConstructorFunc(option.option);
                return instance;
            }
            let len = ConstructorFunc.instances.length;
            if (len) {
                if (len - 1 >= option.index) {
                    return ConstructorFunc.instances[option.index];
                }
                else {
                    throw Error(`current only ${len} instances`);
                }
            }
            else {
                let instance = new ConstructorFunc(option.option);
                return instance;
            }
        }
    }
    GitXSimpleDB.instances = [];

    class TransObj {
        constructor(transRule) {
            this.transRule = transRule;
        }
        fromResp2Obj(source) {
            return this.format(source, "r2o");
        }
        fromObj2Resp(source) {
            return this.format(source, "o2r");
        }
        format(source, type = "r2o") {
            try {
                let result = {};
                let fromArr = this.transRule.from;
                let toArr = this.transRule.to;
                if (type === 'o2r') {
                    fromArr = this.transRule.to;
                    toArr = this.transRule.from;
                }
                let fromKey;
                let sourceData;
                for (let i = 0; i < fromArr.length; i++) {
                    fromKey = fromArr[i];
                    sourceData = source[fromKey];
                    if (source !== undefined && source !== null) {
                        result[toArr[i]] = sourceData;
                    }
                    else {
                        console.warn(`You provided key ${fromKey} can't found in response data.`);
                    }
                }
                return result;
            }
            catch (e) {
                console.error("format response error!");
                throw Error(e.message ? e.message : "format error");
            }
        }
    }
    const AllIssueTrans = new TransObj({
        from: ["comments", "number", "body", "title"],
        to: ["total", "id", "info", "name"],
    });
    new TransObj({
        from: ["id", "updated_at", "body", "number"],
        to: ["id", "updated_at", "data", "number"],
    });

    function transBody(data) {
        if (data.body) {
            try {
                let bodyObj = JSON.parse(data.body);
                data.body = bodyObj;
            }
            catch (e) {
                // console.warn("transform body to json fail")
            }
        }
        return data;
    }
    class IssueWrapper extends GitXSimpleDB {
        static getInstance(option) {
            return GitXSimpleDB.getInstanceByConstructor(option, IssueWrapper);
        }
        preCommonDeal(resp) {
            if (Array.isArray(resp)) {
                resp.forEach(item => {
                    transBody(item);
                });
            }
            else if (isPlainObject(resp)) {
                transBody(resp);
            }
            return resp;
        }
        doRequest(apiName, data, urlVar = undefined, feat) {
            return __awaiter(this, void 0, void 0, function* () {
                let resp = yield this.fetch.request(apiName, data, urlVar, feat);
                return this.preCommonDeal(resp);
            });
        }
        // TODO 当前仅能查到 100 个 issue，后面加一个分页吧
        allTables() {
            return __awaiter(this, void 0, void 0, function* () {
                let resp = yield this.doRequest("all", { state: 'all', per_page: 100, });
                let tables = [];
                for (let table of resp) {
                    tables.push(table);
                }
                let tableGlobal = {};
                tables.forEach(table => { tableGlobal[table.title] = table; });
                this.global.tables = tableGlobal;
                return tables;
            });
        }
        getTable(tableName) {
            return __awaiter(this, void 0, void 0, function* () {
                let tableInfo = yield this.getTableInfo(tableName);
                let resp = yield this.doRequest("one", undefined, { number: tableInfo.number, });
                return resp;
            });
        }
        getTableInfo(tableName, retry = 1) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.global.tables && Object.keys(this.global.tables).length) {
                    if (tableName in this.global.tables) {
                        return this.global.tables[tableName];
                    }
                    else {
                        if (retry >= 0) {
                            // console.warn("retry get all tables.")
                            this.global.tables = null;
                        }
                        else {
                            throw Error("Can not find " + tableName);
                        }
                    }
                }
                yield this.allTables();
                return yield this.getTableInfo(tableName, retry - 1);
            });
        }
        createTable(name, info) {
            return __awaiter(this, void 0, void 0, function* () {
                let requestOption = AllIssueTrans.fromObj2Resp({
                    name,
                    info,
                });
                let resp = yield this.doRequest("create", Object.assign(Object.assign({}, requestOption), { repo: this.options.repo }));
                return resp;
            });
        }
        updateTable(name, data) {
            return __awaiter(this, void 0, void 0, function* () {
                let tableInfo = yield this.getTableInfo(name);
                let number = tableInfo.number;
                let resp = yield this.doRequest("update", { repo: this.options.repo, owner: this.options.owner, number, body: data });
                return resp;
            });
        }
        deleteTable(data) {
            return __awaiter(this, void 0, void 0, function* () {
                throw Error("Current sames not support. may only closed?");
            });
        }
        queryDataByPage(tableName, page = 1, per_page = 100, queryOption = { order: 'desc' }) {
            return __awaiter(this, void 0, void 0, function* () {
                let tableInfo = yield this.getTableInfo(tableName);
                let id = tableInfo.number;
                let queryParam = Object.assign(Object.assign({}, queryOption), { page,
                    per_page });
                let data = yield this.doRequest("repoAllComments", queryParam, { number: id });
                return data;
            });
        }
        queryAllData(tableName, page = 1, queryOption = { order: 'desc' }) {
            return __awaiter(this, void 0, void 0, function* () {
                let latestInfo = yield this.getTable(tableName);
                let total = latestInfo.comments;
                if (!total) {
                    return;
                }
                let per_page = 1;
                let pageNum = Math.floor(total / per_page);
                let result = [];
                for (let i = page; i <= pageNum; i++) {
                    // console.log("prepare query page:" + page)
                    result.push(yield this.queryDataByPage(tableName, i, per_page, queryOption));
                }
                return result;
            });
        }
        addData(tableName, data) {
            return __awaiter(this, void 0, void 0, function* () {
                let tableInfo = yield this.getTableInfo(tableName);
                let id = tableInfo.number;
                let urlVar = { number: id };
                let requestData = { body: typeof data === 'string' ? data : JSON.stringify(data) };
                let resp = yield this.doRequest("addComments", requestData, urlVar);
                return resp;
            });
        }
        updateData(dataId, data) {
            return __awaiter(this, void 0, void 0, function* () {
                let requestData = { body: typeof data === 'string' ? data : JSON.stringify(data), id: dataId };
                let resp = yield this.doRequest("updateComments", requestData);
                return resp;
            });
        }
        deleteData(dataId) {
            return __awaiter(this, void 0, void 0, function* () {
                let resp = yield this.doRequest("delComments", { id: dataId });
                return resp;
            });
        }
    }

    var index = {
        GitXSimpleDB: IssueWrapper
    };

    return index;

})();
//# sourceMappingURL=gitdb_bundle.js.map
