import { IssueWrapper } from "../src/issues/issues_wrapper";
import {gitee, github} from './env'
import { AppSettingsOption } from "../src/settings";

// afterEach(() => {
//     console.log("Has finised ")
// })

// const issueOpe = IssueWrapper.getInstance({option: config as AppSettingsOption})
let title = "AutoGene"
let content = {"desc": "generate from jest"}
let demoDatas = [
    {"name": "John"},
    {"name": "Mary"},
]
let updateData = {
    "id": {},
    "new": {
        "hello": "jest!",
    }
}
let deleteDataId = {};
let shouldDeltedInfo = []
afterAll(() => {
    // console.log(`\u001b[32mPlease visit ${createdTable.html_url} to delete issue manually\u001b[0m`)
    console.log("注意：如果 Query all 遇到错误，说明可能没有清除上次的新增数据，从而导致了错误。")
    for (let info of shouldDeltedInfo) {
        console.log(`\u001b[31mPlease delete issue manually\u001b[0m \u001b[4;32m${info}\u001b[0m `)
    }
})
describe.each([
    ['GITEE', IssueWrapper.getInstance({option: gitee as AppSettingsOption, newForce:true})],
    ['GITEHUB', IssueWrapper.getInstance({option: github as AppSettingsOption, newForce: true})],
])(`[%s] All Issue Operation`, (name, issueOpe) => {
    test(`Be sure ${title} not exist.`, async () => {
        expect.assertions(1)
        try {
            let tableInfo = await issueOpe.getTableInfo(title)
        } catch (e) {
            expect(e.message).toBe("Can not find " + title)
        }
    })
    test(`Query All Tables`, async () => {
        let allTables = await issueOpe.allTables()
        expect(Array.isArray(allTables)).toBe(true)
        // allTables.forEach(v => console.log(`${v.number}----${v.title}`))
        expect(allTables.length).toBe(Object.keys(issueOpe.global.tables).length)
    })
    test(`Create Table(Issue):`, async () => {
        let createdTable = await issueOpe.createTable(title, JSON.stringify(content))
        expect(createdTable.title).toBe(title)
        shouldDeltedInfo.push(createdTable.html_url)
    })
    test(`Update Table(Issue):`, async () => {
        let updatedTable = await issueOpe.updateTable(title, JSON.stringify({Hello: "World!"}))
        expect(updatedTable.body).toEqual({Hello: "World!"})
    })
    test(`Add Data(Comment)`, async () => {
        for (let data of demoDatas) {
            let addedData = await issueOpe.addData(title, data)
            expect(addedData.body.name).toBe(data.name)
            if (data.name === demoDatas[0].name) {
                updateData[name]= {id: addedData.id}
            } else if (data.name === demoDatas[1].name){
                deleteDataId[name] = addedData.id
            }
        }
    })
    
    test(`Query By Page`, async () => {
        let d1 = await issueOpe.queryDataByPage(title, 1, 1)
        console.log("query page data length:", d1.length)
        expect(Array.isArray(d1)).toBe(true)
        expect(d1.length).toBeGreaterThan(0)
        expect(d1[0].body && d1[0].body.name).toMatch(/(Mary|John)/)
    })

    // 对 github 情况下，延长执行时间。
    test(`Query all Data`, async () => {
        let allData = await issueOpe.queryAllData(title)
        expect(Array.isArray(allData)).toBe(true)
        expect(allData.length).toBe(demoDatas.length)
    }, name === 'github' ? 8000 : undefined)

    test(`Update Date(Comment)`, async() => {
        let updatedData = await issueOpe.updateData(updateData[name].id, updateData.new)
        expect(JSON.stringify(updatedData.body)).toBe(JSON.stringify(updateData.new))
    })
    test(`Delete An Not exist Data for [exception validate]`, async() => {
        expect.assertions(1)
        try {
            await issueOpe.deleteData("WRONGID")
        } catch(e) {
            console.log("Not exist exception:",e)
            expect(e.message).toBeTruthy()
        }
    })
    test(`Delete Date(Comment)`, async() => {
        expect(deleteDataId[name]).toBeTruthy()
        let deleted = await issueOpe.deleteData(deleteDataId[name])
        console.log("deleted result:", deleted)
        expect(deleted).toBeFalsy()
    })
    test(`Delete Table`, () => {
        expect.assertions(1)
        return issueOpe.deleteTable({name: title})
            .catch(e => {
                expect(e.message).toMatch(/.*not support.*/)
            })
    })
})






// test(`Add Data(Comment)`, async () => {
//     
// })

// test(`Query Data By Page(Comment)`, async () => {
//     let d1 = await issueOpe.queryDataByPage(title, 1, 1)
//     console.log(d1)
//     expect(Array.isArray(d1)).toBe(true)
//     expect(d1.length).toBeGreaterThan(0)
//     expect(d1[0].body && d1[0].body.name).toMatch(/(Mary|John)/)
// })

// test(`Query All Data(Comment)`, async () => {
//     let data = await issueOpe.queryAllData(title)
//     expect(Array.isArray(data)).toBe(true)
//     expect(data.length).toBe(demoDatas.length)
// })
