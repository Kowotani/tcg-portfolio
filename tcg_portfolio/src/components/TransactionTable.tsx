import { PropsWithChildren, useEffect, useState } from "react"
import { 
  Box,
  Icon,
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
} from "@chakra-ui/react"
import { IDeletableTransaction } from "common";
import { TiArrowSortedDown, TiArrowSortedUp } from 'react-icons/ti'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

// https://chakra-ui.com/getting-started/with-react-table


// ---------------
// table variables
// ---------------

export type TTransactionTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  hiddenColumns?: string[];
};

export const TransactionTable = (
  props: PropsWithChildren<TTransactionTableProps<IDeletableTransaction>>
) => {

  const [sorting, setSorting] = useState<SortingState>([]);

  // default column visibility
  const [columnVisibility, setColumnVisibility] = useState(
    props.hiddenColumns
      ? Object.fromEntries(props.hiddenColumns.map(col => [col, false]))
      : {}
  )

  const table = useReactTable({
    columns: props.columns, 
    data: props.data, 
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnVisibility
    }
  })

  useEffect(() => {
    if (props.hiddenColumns) {
      setColumnVisibility(
        Object.fromEntries(props.hiddenColumns.map(x => [x, false])))
    }
  }, [props.hiddenColumns])


  // ==============
  // main component
  // ==============

  return (
    <Box maxH='220px' overflow='auto'>
      <Table>

        {/* Table Head */}
        {/* zIndex > 0 to display header above delete buttons */}
        <Thead position='sticky' top={0} zIndex={1}>
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
                    p='10px'
                  >
                    <Box 
                      display='flex' 
                      alignItems='center' 
                      justifyContent={meta?.isNumeric ? 'flex-end': 'flex-begin'}
                    >

                      {/* LHS icon */}
                      <Box height='14px'>
                        {header.column.getIsSorted() && meta?.isNumeric ? (
                          header.column.getIsSorted() === "asc" 
                            ? <Icon as={TiArrowSortedUp} boxSize='14px' color='white'/> 
                            : <Icon as={TiArrowSortedDown} boxSize='14px' color='white'/> 
                        ) : null
                        }
                      </Box>          

                      {/* header */}                        
                      <Box>
                        {header.column.columnDef.header}
                      </Box>

                      {/* RHS icon */}              
                      <Box height='14px'>
                        {header.column.getIsSorted() && !meta?.isNumeric ? (
                          header.column.getIsSorted() === "asc" 
                            ? <Icon as={TiArrowSortedUp} boxSize='14px' color='white'/> 
                            : <Icon as={TiArrowSortedDown} boxSize='14px' color='white'/> 
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
                    <Td key={cell.id} isNumeric={meta?.isNumeric} p='10px 10px'>
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
    </Box>
  )
}