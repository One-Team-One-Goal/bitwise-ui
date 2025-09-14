import React from 'react'

interface TableCellProps {
    value: React.ReactNode;
    className?: string;
    isHeader?: boolean;
}

export const TableCell: React.FC<TableCellProps> = (
    { value, className, isHeader = false }
) => {
  if (isHeader) {
    return (
        <th className={className}>
            {value}
        </th>
    )
  }

  return (
    <td className={className}>
        {value}
    </td>
  )
}
