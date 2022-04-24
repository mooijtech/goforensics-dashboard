/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {Fragment, useLayoutEffect, useRef, useState} from 'react'
import {
    useAsyncDebounce,
    useFilters,
    useGlobalFilter,
    usePagination,
    useResizeColumns,
    useRowSelect,
    useSortBy,
    useTable,
    useColumnOrder,
} from 'react-table'
import {ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/solid'
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {useContextMenu} from "react-contexify";

export function SortIcon({className}) {
    return (
        <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512"
             height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path>
        </svg>
    )
}

export function SortUpIcon({className}) {
    return (
        <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512"
             height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path>
        </svg>
    )
}

export function SortDownIcon({className}) {
    return (
        <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512"
             height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path>
        </svg>
    )
}

export function Button({children, className, ...rest}) {
    return (
        <button
            type="button"
            className={
                classNames(
                    "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
                    className
                )}
            {...rest}
        >
            {children}
        </button>
    )
}

export function PageButton({children, className, ...rest}) {
    return (
        <button
            type="button"
            className={
                classNames(
                    "relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
                    className
                )}
            {...rest}
        >
            {children}
        </button>
    )
}

export function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

// Define a default UI for filtering
function GlobalFilter({preGlobalFilteredRows, globalFilter, setGlobalFilter}) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)

    return (
        <label className="flex gap-x-2 items-baseline">
            <div>
                <label htmlFor="filter" className="sr-only">
                    Filter
                </label>
                <input
                    type="text"
                    name="filter"
                    id="filter"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder={`Filter ${count} items...`}
                    value={value || ""}
                    onChange={e => {
                        setValue(e.target.value);
                        onChange(e.target.value);
                    }}
                />
            </div>
        </label>
    )
}

export function DefaultCell(props) {
    return (
        <div className={"truncate"} style={{width: props.column.width, minWidth: props.column.minWidth}}>{props.value}</div>
    )
}

function Table({
                   data,
                   setData,
                   columns,
                   currentCheckboxItems,
                   setCurrentCheckboxItems,
                   currentSelectedItem,
                   setCurrentSelectedItem,
                   headerChildren,
                   rowHoverTitle,
                   onRowClick,
                   contextMenu
               }) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state,
        preGlobalFilteredRows,
        setGlobalFilter,
        allColumns,
        setColumnOrder,
    } = useTable({
            columns,
            data,
        },
        useFilters,
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect,
        useColumnOrder,
        useResizeColumns,
    )

    const {show} = useContextMenu({
        id: "contextMenu",
    });

    function handleContextMenu(event) {
        event.preventDefault();
        show(event);
    }

    const checkbox = useRef()
    const [checked, setChecked] = useState(false)
    const [indeterminate, setIndeterminate] = useState(false)

    useLayoutEffect(() => {
        const isIndeterminate = currentCheckboxItems.length > 0 && currentCheckboxItems.length < data.length
        setChecked(currentCheckboxItems.length === data.length)
        setIndeterminate(isIndeterminate)
        checkbox.current.indeterminate = isIndeterminate
    }, [currentCheckboxItems])

    function toggleAll() {
        setCurrentCheckboxItems(checked || indeterminate ? [] : data.map((value, i) => "" + i))
        setChecked(!checked && !indeterminate)
        setIndeterminate(false)
    }

    const getDragItemStyle = ({isDragging, isDropAnimating}, draggableStyle) => ({
        ...draggableStyle,
        userSelect: "none",
        background: isDragging ? "#4F46E5" : undefined,
        color: isDragging ? "white" : undefined,
        ...(!isDragging && {transform: "translate(0,0)"}),
        ...(isDropAnimating && {transitionDuration: "0.001s"})
    });

    const currentColumnOrder = useRef();

    const [isDragDisabled, setIsDragDisabled] = useState(false)

    return (
        <div className="flex flex-col h-full">
            <div className="sm:flex sm:gap-x-2 mb-4">

                <div className={classNames("flex items-center", headerChildren ? undefined : "hidden")}>
                    {headerChildren && headerChildren()}
                </div>

                <GlobalFilter
                    preGlobalFilteredRows={preGlobalFilteredRows}
                    globalFilter={state.globalFilter}
                    setGlobalFilter={setGlobalFilter}
                />
                {headerGroups.map((headerGroup) =>
                    headerGroup.headers.map((column) =>
                        column.Filter ? (
                            <div className="mt-2 sm:mt-0" key={column.id}>
                                {column.render("Filter")}
                            </div>
                        ) : null
                    )
                )}
            </div>

            <div className="-my-2 -mx-4 overflow-x-auto w-full sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        {currentCheckboxItems.length > 0 && (
                            <div
                                className="absolute top-0 left-12 flex h-12 items-center space-x-3 bg-gray-50 sm:left-16">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                                    onClick={(event) => {
                                        handleContextMenu(event)
                                    }}
                                >
                                    Actions
                                </button>
                            </div>
                        )}

                        {contextMenu && contextMenu()}

                        <table {...getTableProps()} className="min-w-full table-fixed divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                            {headerGroups.map(headerGroup => (

                                <DragDropContext
                                    onDragStart={() => {
                                        currentColumnOrder.current = allColumns.map(o => o.id);
                                    }}
                                    onDragUpdate={(dragUpdateObj, b) => {
                                        const colOrder = [...currentColumnOrder.current];
                                        const sIndex = dragUpdateObj.source.index;
                                        const dIndex = dragUpdateObj.destination && dragUpdateObj.destination.index;

                                        if (typeof sIndex === "number" && typeof dIndex === "number") {
                                            colOrder.splice(sIndex, 1);
                                            colOrder.splice(dIndex, 0, dragUpdateObj.draggableId);
                                            setColumnOrder(colOrder);
                                        }
                                    }}
                                >
                                    <Droppable droppableId="droppable" direction="horizontal">
                                        {(droppableProvided, snapshot) => (
                                            <tr
                                                {...headerGroup.getHeaderGroupProps()}
                                                ref={droppableProvided.innerRef}
                                                className="divide-x"
                                            >
                                                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                                                    <input
                                                        type="checkbox"
                                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                                                        ref={checkbox}
                                                        checked={checked}
                                                        onChange={toggleAll}
                                                    />
                                                </th>

                                                {headerGroup.headers.map((column, index) => (
                                                    <Draggable
                                                        key={column.id}
                                                        draggableId={column.id}
                                                        index={index}
                                                        isDragDisabled={isDragDisabled}
                                                    >
                                                        {(provided, snapshot) => {
                                                            return (
                                                                <th scope="col"
                                                                    className={classNames("group px-3 py-3.5 text-left text-sm font-semibold text-gray-900", index === 0 && currentCheckboxItems.length > 0 ? "invisible" : undefined)}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                                                    ref={provided.innerRef}
                                                                    style={{
                                                                        ...getDragItemStyle(
                                                                            snapshot,
                                                                            provided.draggableProps.style,
                                                                        )
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={classNames("group flex flex-1 flex-row items-center")}>
                                                                        {column.render('Header')}

                                                                        <div
                                                                            {...column.getResizerProps()}
                                                                            className={"inline-block group-hover:bg-indigo-500 w-3 h-full absolute top-0 right-0 z-10 touch-none"}
                                                                            title={"Resize column"}
                                                                            onMouseEnter={() => {
                                                                                setIsDragDisabled(true)
                                                                            }}
                                                                            onMouseLeave={() => {
                                                                                setIsDragDisabled(false);
                                                                            }}
                                                                        />

                                                                        <span>
                                                {column.isSorted
                                                    ? column.isSortedDesc
                                                        ? <SortDownIcon className="ml-1 w-4 h-4 text-gray-400"/>
                                                        : <SortUpIcon className="ml-1 w-4 h-4 text-gray-400"/>
                                                    : (
                                                        <SortIcon
                                                            className="ml-1 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100"/>
                                                    )}
                                                </span>
                                                                    </div>
                                                                </th>
                                                            )
                                                        }}
                                                    </Draggable>
                                                ))}
                                            </tr>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            ))}
                            </thead>
                            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white">
                            {page.map((row, i) => {
                                prepareRow(row);

                                return (
                                    <tr
                                        {...row.getRowProps()}
                                        key={"row-" + row.id}
                                        className={classNames("h-12 divide-x", currentCheckboxItems.includes(row.id) ? "bg-gray-50" : undefined, currentSelectedItem === row.id ? "bg-gray-200" : undefined)}>
                                        <td role="cell" className="relative w-12 px-6 sm:w-16 sm:px-8">
                                            {currentCheckboxItems.includes(row.id) || currentSelectedItem === row.id ? (
                                                <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"
                                                     key={row.id}/>
                                            ) : undefined}

                                            <input
                                                type="checkbox"
                                                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                                                value={row.id}
                                                checked={currentCheckboxItems.includes(row.id)}
                                                onChange={(event) =>
                                                    setCurrentCheckboxItems(
                                                        event.target.checked
                                                            ? [...currentCheckboxItems, row.id]
                                                            : currentCheckboxItems.filter((id) => id !== row.id)
                                                    )
                                                }
                                            />
                                        </td>

                                        {row.cells.map((cell, index) => {
                                            return (
                                                <Fragment key={"row-" + row.id + "-cell-" + index}>
                                                    {index === 0 ?
                                                        <td
                                                            role="cell"
                                                            className={classNames('whitespace-nowrap pl-4 py-4 pr-3 text-sm font-medium cursor-pointer', currentCheckboxItems.includes(row.id) || currentSelectedItem === row.id ? 'text-indigo-600' : 'text-gray-900')}
                                                            onClick={() => {
                                                                setCurrentSelectedItem(row.id);

                                                                if (onRowClick) {
                                                                    onRowClick(row.id);
                                                                }
                                                            }}
                                                            {...cell.getCellProps()}
                                                            title={rowHoverTitle}
                                                            onContextMenu={(event) => handleContextMenu(event)}
                                                        >
                                                            {cell.render("Cell")}
                                                        </td>
                                                        :
                                                        <td
                                                            role="cell"
                                                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 cursor-pointer"
                                                            onClick={() => {
                                                                setCurrentSelectedItem(row.id)

                                                                if (onRowClick) {
                                                                    onRowClick(row.id)
                                                                }
                                                            }}
                                                            {...cell.getCellProps()}
                                                            title={rowHoverTitle}
                                                            onContextMenu={(event) => handleContextMenu(event, row)}
                                                        >
                                                            {cell.render('Cell')}
                                                        </td>
                                                    }
                                                </Fragment>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="py-3 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                    <Button onClick={() => previousPage()} disabled={!canPreviousPage}>Previous</Button>
                    <Button onClick={() => nextPage()} disabled={!canNextPage}>Next</Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex gap-x-2 items-baseline">
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{state.pageIndex + 1}</span> of <span
                className="font-medium">{pageOptions.length}</span>
            </span>
                        <label>
                            <span className="sr-only">Items Per Page</span>
                            <select
                                className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={state.pageSize}
                                onChange={e => {
                                    setPageSize(Number(e.target.value))
                                }}
                            >
                                {[5, 10, 20, 30, 40, 50, 100].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>
                                        Show {pageSize}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                             aria-label="Pagination">
                            <PageButton
                                className="rounded-l-md"
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                            >
                                <span className="sr-only">First</span>
                                <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </PageButton>
                            <PageButton
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </PageButton>
                            <PageButton
                                onClick={() => nextPage()}
                                disabled={!canNextPage
                                }>
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </PageButton>
                            <PageButton
                                className="rounded-r-md"
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}
                            >
                                <span className="sr-only">Last</span>
                                <ChevronDoubleRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </PageButton>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Table;