
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  
  interface Column<T> {
    accessorKey: keyof T;
    header: string;
    cell?: (value: any, row: T) => React.ReactNode;
  }
  
  interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    className?: string;
  }
  
  export function DataTable<T>({ columns, data, className }: DataTableProps<T>) {
    return (
      <div className={`glass-effect rounded-lg border border-border/50 overflow-hidden ${className}`}>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              {columns.map((column, index) => (
                <TableHead key={index} className="text-foreground font-semibold bg-muted/30">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className="border-border/30 hover:bg-muted/20 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="py-4">
                      {column.cell 
                        ? column.cell(row[column.accessorKey], row)
                        : String(row[column.accessorKey] || '')
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }