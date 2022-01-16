import GitXSimpleDB from "../src/base_operation";

let instance = GitXSimpleDB.getInstance()
describe("About instance num control", () => {
    test("test getInstance directly", () => {
        expect(GitXSimpleDB.getInstance()).toBe(instance)
    })
    test("transfer [newForce] flag", () => {
        let newInstance = GitXSimpleDB.getInstance({ newForce: true, option: { owner: "fake", repo: "fake", } })
        expect(newInstance).not.toEqual(instance)
        instance = newInstance
        expect(GitXSimpleDB.instances.length).toBe(2)
    })
    test("use [index] option", () => {
        expect(GitXSimpleDB.getInstance({ index: 1 })).toBe(instance)
    })
})
