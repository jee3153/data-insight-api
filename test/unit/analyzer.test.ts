import { expect, it, describe } from 'vitest'
import { analyzeDataset } from '../../src/lib/analyzer'

describe("analyzeDataset tests", () => {

    it("should parse cvsText and return summary of each column", async () => {
        const cvsText = "score,name\n10,bob\n20,alice"
        const expected = {
            columns: {
                score: {
                    type: "number",
                    missing: 0,
                    unique: 2,
                    suggest_chart: "histogram"
                },
                name: {
                    type: "string",
                    missing: 0,
                    unique: 2,
                    suggest_chart: "bar"
                }
            }
        }

        expect(analyzeDataset(cvsText)).toEqual(expected)
    })

    it("should throw error when each column size doesn't match", () => {
        const cvsText = "score,name\n10\n20,alice"

        expect(() => analyzeDataset(cvsText))
            .toThrowError(new Error("Couldn't parse due to Error: Invalid Record Length: columns length is 2, got 1 on line 2"))
    })

    it("should analysis return number of missing values if there are any", () => {
        const cvsText = "score,name\n10,\n20,alice"

        expect(analyzeDataset(cvsText).columns.name.missing).toBe(1)
        expect(analyzeDataset(cvsText).columns.score.missing).toBe(0)
    })
})