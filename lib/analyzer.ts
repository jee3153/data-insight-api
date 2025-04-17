import { parse } from "csv-parse/sync";
import { Summary } from '../types/analyzerTypes'

export function analyzeDataset(cvsText: string): Summary {
    const records = parse(cvsText, {
        columns: true,
        skip_empty_lines: true
    })

    const summary: Summary = { columns: {} }
    const columns = Object.keys(records[0])

    for (const col of columns) {
        const values = records.map((row: any) => row[col])
        const nonNull = values.filter((val: any) => val !== '' && val != null)
        const unique = new Set(nonNull)
        const inferredType = inferType(nonNull)

        summary.columns[col] = {
            type: inferredType,
            missing: values.length - nonNull.length,
            unique: unique.size,
            suggest_chart: suggestChart(inferredType, unique.size)
        }
    }

    return summary
}

function inferType(values: any[]): string {
    if (values.every((val: any) => !isNaN(parseFloat(val)))) {
        return "number"
    }
    return "string"
}

function suggestChart(type: string, unique: number): string {
    if (type == "number") return "histogram"
    if (unique <= 10) return "bar"
    return "pie"
}