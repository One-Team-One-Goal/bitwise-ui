import { 
    Table,
    TableCell,
    TableHeader,
    TableRow,
    TableHead,
    TableBody
} from "../../../components/ui/table";
import { type CellValue } from "@/utils/karnaugh.utils";

interface TruthTableRow {
    input: string;
    output: CellValue;
    index: number;
}

interface TruthTableProps {
    variables: string[];
    truthTable?: TruthTableRow[];
    onTruthTableChange?: (index: number, value: CellValue) => void;
}

function generateTruthTables(numVars: number): number[][] {
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

const cycleCellValue = (currentValue: CellValue): CellValue => {
    if (currentValue === 'X') return 0;
    if (currentValue === 0) return 1;
    return 'X';
};

const TruthTable: React.FC<TruthTableProps> = ({ variables, truthTable, onTruthTableChange }) => {
    const table = generateTruthTables(variables.length);

    const handleOutputClick = (index: number) => {
        if (truthTable && onTruthTableChange) {
            const currentValue = truthTable[index]?.output || 'X';
            const newValue = cycleCellValue(currentValue);
            onTruthTableChange(index, newValue);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="border-2 border-primary rounded-lg overflow-hidden shadow-lg">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary">
                            {variables.map((variable) => (
                                <TableHead 
                                    key={variable}
                                    className="p-2 text-center font-semibold text-primary-foreground border-r border-primary-foreground/20 last:border-r-0"
                                >
                                    {variable}
                                </TableHead>
                            ))}
                            <TableHead className="p-2 text-center font-semibold text-primary-foreground">
                                R
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-card">
                        {table.map((row, rowIdx) => {
                            const truthRow = truthTable?.[rowIdx];
                            return (
                                <TableRow 
                                    key={rowIdx}
                                    className={`border-b border-border last:border-b-0 hover:bg-secondary/50 ${
                                        rowIdx % 2 === 0 ? "bg-secondary/30" : "bg-card"
                                    }`}
                                >
                                    {row.map((val, colIdx) => (
                                        <TableCell
                                            key={colIdx}
                                            className="text-center border-r border-border last:border-r-0 font-mono"
                                        >
                                            {val}
                                        </TableCell>
                                    ))}
                                    <TableCell 
                                        className="text-center font-mono cursor-pointer hover:bg-blue-100 transition-colors"
                                        onClick={() => handleOutputClick(rowIdx)}
                                        style={{
                                            color: truthRow?.output === 1 ? '#16a34a' : 
                                                   truthRow?.output === 0 ? '#dc2626' : '#6b7280'
                                        }}
                                    >
                                        {truthRow?.output ?? 'X'}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default TruthTable