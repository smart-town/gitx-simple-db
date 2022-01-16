# gitee-simple-db

#### 介绍

通过 gitee api，将仓库的 issue 作为表，每个 issue 的评论作为表数据，方便地动态存储个人数据。

### 背景

日常做一些小工具时可能需要存储一些简单的数据到数据库， 通常来讲需要能够从公网访问。个人搜寻思考的有以下方案：

1. 搭建自己的传统关系型或非关系型数据库（通常来讲需要购买一个服务器或是需要有一个公网 IP 入口来使用自己的服务器），不过有以下几点问题：
    - 购买服务器有时间限制，到期需要**付费**或者**迁移数据**等。
    - ⭐ 有自己的 IP 入口， 以此搭建服务器的话再好不过，但是可能会涉及到 IP **变化**等（对我这种居无定所的人而言），需要更改很多既有的应用设置
    - 使用内网穿透工具，如 natapp 等，**付费**拿到二级域名，这样就可以有一个固定的入口，无论肉身在何处，都可以通过该域名和对应的*隧道*进入自己的服务器
2. 使用免费的在线数据库
    - 搜索一些在线的数据库来用，不过一来对于私密数据不太使用，二来通常存储空间很小，三来稳定性得不到保障
3. 使用[飞书](https://open.feishu.cn/document/ugTM5UjL4ETO14COxkTN/uETMzUjLxEzM14SMxMTN) 等其他类似的云文档 API 存储数据
    - 方便且可视化，对于我而言是可考虑的方案。这里是[一篇](https://zhuanlan.zhihu.com/p/234834695)介绍的文档。
    - 支持按照条件搜索

对于我而言，需要一个**便宜**（白嫖）、**稳定可靠**（持久到永远~）、**性能要求不高**（主要是存储一些简单数据）、**易于访问**、**私密性有一定要求**的个人数据库

最后我瞄上了**github issue**。像`gitlab`、`国内gitee`等 git 代码平台都支持`issue`，可以轻易地使用 API 进行 issue 操作。 这些平台的仓库也都支持**私密**或**分享**，可以很方便地**控制权限**。

### 快速体验

访问 [github](https://github.com/apps/gitxdbapp) 或 [gitee](https://lhhcherry.gitee.io/ssmell/gitxdb/) Pages 服务，授权以体验（其实就相当于一个 issue 的三方客户端），**注意**需要安装 github 的应用，才能授权执行 api 操作。

### 快速使用

1. 页面引入 dist 目录下已经打包好的`gitdb_bundle.js`
2. 全局可以使用`gitdb`变量名来访问该库
3. 快速生成一个实例来使用：
    ```js
    var type = 'gitee'
    var instance = gitdb.GitXSimpleDB.getInstance({
        option: {
            owner: '',  // 用户名
            repo: '',  // 仓库名
            access_token: '', // 可以是你的 gitee 或 github 授权码
            hostBase: type === 'gitee' ? 'https://gitee.com/api/v5' : 'https://api.github.com'}
    })
    ```
4. 相关的几个方法：
    操作 | 方法及参数
    ---- | -----
    新建表 | instance.createTable(tableName, tableDesc)
    更新表 | instance.updateTable(tableName, tableDesc)
    删除表 | api 不支持
    新增数据 | addData(tableName, data)
    更新数据 | updateData(dataId, data)
    删除数据 | deleteData(dataId)
    分页查询 | queryDataByPage(tableName, page:number, per_page:number)

**注意**：    
1. 目前只打包了浏览器端
2. 使用的是 es6 语法并未做 babel 转换
3. 所有的`data`选项都可以直接传递对象，此时查询回的数据项也会自动转换为对象。

### 限制

#### 平台限制
使用平台 API 操作 ISSUE 及其评论作为 个人数据库也有一些限制，这主要取决于各个平台的限制。
##### 请求次数限制

对于 github 而言， [限制见此处](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)

主要分为**已认证**和**未认证**两种请求，未认证请求每小时限制发出 60 个，而已认证请求则允许每小时 5000 个。不过需要注意的是认证请求是和认证的用户是绑定的，而无论是通过 OAuth 还是基础认证。意味着所有使用用户认证的 APP 共享这 5000 个请求限额。

另外，根据测试，`gitee` 的 API，对于未认证的请求，每小时似乎也是 60 个，而对于已认证的请求，则没有看到明显的限制。

执行以下代码，观察 `x-ratelimit-limit` 等请求头信息，可以看到相关信息：

```shell
curl -i https://api.github.com/zen | grep -i x-ratelimit*
curl -i https://gitee.com/api/v5/users/smalltown/starred | grep -i "x-ratelimit*"
```
##### 其他限制

github 似乎会限制 issue 的评论数量，而 gitee 目前还不甚清楚。这里暂时不进行特别处理以规避这种限制。所以需要注意数据量的限制。

#### 本身限制

由于基于平台 API 进行数据增删改查，因此不能很好地支持并发写入同一条目。不过由于本身该项目的目标只是为了简单存储，因此关系倒也不大。

### 实现功能

主要实现：查询表数据，分页查询，新增，修改，删除。


