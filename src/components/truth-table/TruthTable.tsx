import { 
    Table,
    TableCell,
    TableHeader,
    TableRow,
    TableHead,
    TableBody
} from "../ui/table";
import { generateTruthTables } from "./utils/permutations";

interface TruthTableProps {
    variables: string[];
}

const TruthTable: React.FC<TruthTableProps> = ({ variables }) => {
    const table = generateTruthTables(variables.length);

    const handleClick = (rowIdx: number, colIdx: number) => {
        console.log(`Clicked on row ${rowIdx}, column ${colIdx}`);
    }

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
                        {table.map((row, rowIdx) => (
                            <TableRow 
                                key={rowIdx}
                                className={`border-b border-border last:border-b-0 hover:bg-secondary/50 ${
                                    rowIdx % 2 === 0 ? "bg-secondary/30" : "bg-card"
                                }`}
                            >
                                {row.map((val, colIdx) => (
                                    <TableCell
                                        key={colIdx}
                                        onClick={() => handleClick(rowIdx, colIdx)}
                                        className="text-center border-r border-border last:border-r-0 font-mono cursor-pointer"
                                    >
                                        {val}
                                    </TableCell>
                                ))}
                                <TableCell className="text-center font-mono text-muted-foreground">
                                    0
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default TruthTable