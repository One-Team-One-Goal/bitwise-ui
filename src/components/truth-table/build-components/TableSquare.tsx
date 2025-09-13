import { TableCell } from "@/components/ui/table";

interface TableSquareProps {
  value: string | number
  onClick?: () => void
}

export function TableSquare({ value, onClick }: TableSquareProps) {
  return (
    <TableCell
        onClick={onClick}
        className="cursor-pointer text-center"
    >
        {value}
    </TableCell>
  )
}
