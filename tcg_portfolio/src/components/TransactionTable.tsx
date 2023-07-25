import { PropsWithChildren, useState } from "react"
import { 
  Box,
  chakra,
  Icon,
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
} from "@chakra-ui/react"
import { ITransaction } from "common";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowData,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { TiArrowSortedDown, TiArrowSortedUp } from 'react-icons/ti'

// https://chakra-ui.com/getting-started/with-react-table


// ==========
// interfaces
// ==========

interface IColumnMeta<TData extends RowData, TValue> {

}


// =====
// types
// =====

export type TTransactionTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
};

export const TransactionTable = (
  props: PropsWithChildren<TTransactionTableProps<ITransaction>>
) => {

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    columns: props.columns, 
    data: props.data, 
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  })



  return (
    <Table>

      {/* Table Head */}
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header: any) => {
              // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
              const meta: any = header.column.columnDef.meta
              return (
                <Th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  backgroundColor='gray.600'
                  color='white'
                  isNumeric={meta?.isNumeric}
                  p='16px'
                >
                  <Box display='flex' alignItems='center' justifyContent={meta?.isNumeric ? 'flex-end': 'flex-begin'}>

                    {/* LHS icon */}
                    <Box height='16px'>
                      {header.column.getIsSorted() && meta?.isNumeric ? (
                        header.column.getIsSorted() === "asc" 
                          ? <Icon as={TiArrowSortedUp} boxSize='16px' color='white'/> 
                          : <Icon as={TiArrowSortedDown} boxSize='16px' color='white'/> 
                      ) : null
                      }
                    </Box>          

                    {/* header */}                        
                    <Box>
                      {header.column.columnDef.header}
                    </Box>

                    {/* RHS icon */}              
                    <Box height='16px'>
                      {header.column.getIsSorted() && !meta?.isNumeric ? (
                        header.column.getIsSorted() === "asc" 
                          ? <Icon as={TiArrowSortedUp} boxSize='16px' color='white'/> 
                          : <Icon as={TiArrowSortedDown} boxSize='16px' color='white'/> 
                      ) : null
                      }
                    </Box>                
                  </Box>   
                </Th>
              )
            })}
          </Tr>
        ))}
      </Thead>

      {/* Table Body */}
      <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                 // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                const meta: any = cell.column.columnDef.meta
                return (
                  <Td key={cell.id} isNumeric={meta?.isNumeric}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </Td>
                )
              })}
            </Tr>
          ))}
      </Tbody>

    </Table>
  )
}