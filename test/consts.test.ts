import ApiConsts from '../src/issues/consts'

function checkConstsFormat(data:any):boolean {
    for (let key in data) {
        let v = data[key]
        if (v.length != 2 || !Array.isArray(v)) {
            return false
        }
    }
    return true
}
test("check ApiConsts consts format:", () => {
    for (let ConstsSet in ApiConsts) {
        expect(checkConstsFormat(ApiConsts[ConstsSet])).toBe(true)
    }
})