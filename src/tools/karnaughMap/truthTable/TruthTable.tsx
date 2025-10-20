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

const TruthTable: React.FC<TruthTableProps> = ({ variables, truthTable, onTruthTableChange }) => {
    const table = generateTruthTables(variables.length);

    const handleOutputClick = (index: number) => {
        if (truthTable && onTruthTableChange) {
            const currentValue = truthTable[index]?.output ?? 'X';
            
            let newValue: CellValue;
            if (currentValue === 'X') {
                newValue = 0;
            } else if (currentValue === 0) {
                newValue = 1;
            } else {
                newValue = 'X';
            }
            
            onTruthTableChange(index, newValue);
        }
    };

    const getValueColor = (value: CellValue) => {
        if (value === 1) return '#16a34a'; // Green for 1
        if (value === 0) return '#6b7280'; // Gray for 0
        return '#dc2626'; // Red for X
    };

    const getCellStyle = (value: CellValue) => ({
        color: getValueColor(value),
        fontWeight: 600,
        backgroundColor: value === 1 ? '#f0f9ff' : 
                        value === 0 ? '#f9fafb' : '#fef2f2' 
                        
    });

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="border lg overflow-hidden max-h-[500px] overflow-y-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted/80 transition-colors">
                            {variables.map((variable) => (
                                <TableHead 
                                    key={variable}
                                    className="p-2 text-center font-semibold text-primary border-r last:border-r-0"
                                >
                                    {variable}
                                </TableHead>
                            ))}
                            <TableHead className="p-2 text-center font-semibold text-primary">
                                R
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-card">
                        {table.map((row, rowIdx) => {
                            const truthRow = truthTable?.[rowIdx];
                            const outputValue = truthRow?.output ?? 'X';
                            
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
                                            className="text-center border-r border-border last:border-r-0 font-mono p-3"
                                        >
                                            <span className="font-semibold">{val}</span>
                                        </TableCell>
                                    ))}
                                    <TableCell 
                                        className="text-center font-mono cursor-pointer hover:bg-blue-100 active:bg-blue-200 transition-all duration-150 p-3 select-none"
                                        onClick={() => handleOutputClick(rowIdx)}
                                        style={getCellStyle(outputValue)}
                                        title={`Click to cycle: ${outputValue} → ${
                                            outputValue === 'X' ? '0' : 
                                            outputValue === 0 ? '1' : 'X'
                                        }`}
                                    >
                                        {outputValue}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            
            {/* Instructions */}
            <div className="mt-2 text-xs text-gray-600 text-center">
                Click on R values to cycle: X → 0 → 1 → X
            </div>
        </div>
    )
}

export default TruthTable