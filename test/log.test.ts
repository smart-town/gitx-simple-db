import { Log } from "../src/log";

const log = new Log("test-log", "INFO")
describe("Test Log Util:", () => {
    test("Test static method:", () => {
        expect(Log.log("Hello, method")).toBe(undefined)
    })
    test("Test trace method:", () => {
        expect(log.trace("Hello, method")).toBe(undefined)
    })
    test("Test debug method:", () => {
        expect(log.debug("Hello, method")).toBe(undefined)
    })
    test("Test info method:", () => {
        expect(log.info("Hello, method")).toBe(undefined)
    })
    test("Test warn method:", () => {
        expect(log.warn("Hello, method")).toBe(undefined)
    })
    test("Test error method:", () => {
        expect(log.error("Hello, method")).toBe(undefined)
    })
})