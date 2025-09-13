export function generateTruthTables(numVars: number): number[][] {
    const rows = Math.pow(2, numVars);
    const table: number[][] = [];

    for (let i = 0; i < rows; i++) {
        const row: number[] = [];
        for (let j = numVars - 1; j >= 0; j--) {
            row.push((i >> j) & 1);
        }
        table.push(row);
    }

    return table;
}