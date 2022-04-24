/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React from "react";
import Table, {DefaultCell} from "./table";
import {useMemo, useState} from "react";
import dynamic from "next/dynamic";
import {Tab} from "@headlessui/react"
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import ContextMenuMessagesView from "./contextmenus/messagesview";
import {data} from "autoprefixer";

const Allotment = dynamic(() => import("allotment").then(mod => mod.Allotment), {ssr: false});

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function BookmarkCell(props) {
    let bookmarked = props.value ? "Bookmarked" : ""

    return (
        <span
            className={
                classNames(
                    "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
                    props.value ? "bg-green-100 text-green-800" : "invisible",
                )
            }
        >
            {bookmarked}
        </span>
    );
}

const MessagesView = ({messages, setMessages, removeFromTableOnRemoveBookmark = false, padding = false}) => {
    const columns = useMemo(
        () => [
            {
                Header: "Subject",
                accessor: "subject",
                Cell: DefaultCell,
                maxWidth: 600,
                minWidth: 40,
                width: 300,
            },
            {
                Header: "From",
                accessor: "from",
                Cell: DefaultCell,
                maxWidth: 600,
                minWidth: 40,
                width: 300,
            },
            {
                Header: "To",
                accessor: "to",
                Cell: DefaultCell,
                maxWidth: 600,
                minWidth: 40,
                width: 300,
            },
            {
                Header: "CC",
                accessor: "cc",
                Cell: DefaultCell,
                maxWidth: 600,
                minWidth: 40,
                width: 40,
            },
            {
                Header: "BCC",
                accessor: "bcc",
                Cell: DefaultCell,
                maxWidth: 600,
                minWidth: 40,
                width: 40,
            },
            {
                Header: "Received",
                accessor: "received",
                Cell: DefaultCell,
                maxWidth: 600,
                minWidth: 40,
                width: 40,
            },
            {
                Header: "Size",
                accessor: "size",
                Cell: DefaultCell,
                maxWidth: 600,
                minWidth: 40,
                width: 40,
            },
            {
                Header: "Tag",
                accessor: "tag",
                Cell: DefaultCell,
                maxWidth: 600,
                minWidth: 40,
                width: 40,
            },
            {
                Header: "Bookmarked",
                accessor: "bookmark",
                Cell: BookmarkCell,
                maxWidth: 600,
                minWidth: 40,
                width: 40,
            },
        ],
        []
    );

    const [currentCheckboxItems, setCurrentCheckboxItems] = useState([]);
    const [currentSelectedItem, setCurrentSelectedItem] = useState();

    const htmlFrom = (htmlString) => {
        const cleanHtmlString = DOMPurify.sanitize(htmlString,
            { USE_PROFILES: { html: true } });

        return parse(cleanHtmlString);
    }

    return (
        <Allotment vertical={true}>
            <div className={classNames("flex flex-1 flex-col h-full", padding ? "p-4" : "")}>
                <Table
                    data={messages}
                    setData={setMessages}
                    columns={columns}
                    setCurrentCheckboxItems={setCurrentCheckboxItems}
                    currentCheckboxItems={currentCheckboxItems}
                    setCurrentSelectedItem={setCurrentSelectedItem}
                    currentSelectedItem={currentSelectedItem}
                    removeFromTableOnRemoveBookmark={removeFromTableOnRemoveBookmark}
                    contextMenu={() =>
                        <ContextMenuMessagesView
                            currentCheckboxItems={currentCheckboxItems}
                            data={messages}
                            setData={setMessages}
                            removeFromTableOnRemoveBookmark={removeFromTableOnRemoveBookmark}/>}
                    rowHoverTitle={"View message"}
                />
            </div>
            <div className={classNames("flex flex-1 h-full pl-4 pt-4", padding ? "pl-4" : "")}>

                <div>
                    {/*<div className="sm:hidden">*/}
                    {/*    <label htmlFor="tabs" className="sr-only">*/}
                    {/*        Select a tab*/}
                    {/*    </label>*/}
                    {/*     Use an "onChange" listener to redirect the user to the selected tab URL. */}
                    {/*    <select*/}
                    {/*        id="tabs"*/}
                    {/*        name="tabs"*/}
                    {/*        className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"*/}
                    {/*        defaultValue={tabs.find((tab) => tab.current).name}*/}
                    {/*    >*/}
                    {/*        {tabs.map((tab) => (*/}
                    {/*            <option key={tab.name}>{tab.name}</option>*/}
                    {/*        ))}*/}
                    {/*    </select>*/}
                    {/*</div>*/}
                    <div className="block">
                        <nav className="flex space-x-4" aria-label="Tabs">

                            <Tab.Group as={"div"} className={"flex flex-col"}>
                                <Tab.List className="flex flex-1 space-x-4" aria-label="Tabs">
                                    <Tab className={({ selected}) => classNames(
                                        selected ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700',
                                        'px-3 py-2 font-medium text-sm rounded-md'
                                    )}>Message</Tab>
                                    <Tab className={({ selected}) => classNames(
                                        selected ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700',
                                        'px-3 py-2 font-medium text-sm rounded-md'
                                    )}>Headers</Tab>
                                    <Tab className={({ selected}) => classNames(
                                        selected ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700',
                                        'px-3 py-2 font-medium text-sm rounded-md'
                                    )}>
                                        Attachments { messages[currentSelectedItem] === undefined ?
                                        <span>(0)</span>
                                        :
                                        <span>
                                            {messages[currentSelectedItem].attachments === null ?
                                                <span>(0)</span>
                                                :
                                                <span>({messages[currentSelectedItem].attachments.length})</span>
                                            }
                                        </span>
                                    }
                                    </Tab>
                                </Tab.List>
                                <Tab.Panels className={"mt-6 w-screen h-screen"}>
                                    <Tab.Panel>
                                        {currentSelectedItem === undefined ?
                                            <span>No message selected</span>
                                            :
                                            <div className={"max-w-3xl h-48 overflow-y-scroll"}>
                                                <>
                                                    {htmlFrom(messages[currentSelectedItem].body.replaceAll("\n", "<br>"))}
                                                </>
                                            </div>
                                        }
                                    </Tab.Panel>
                                    <Tab.Panel>
                                        {currentSelectedItem === undefined ?
                                            <span>No message selected</span>
                                            :
                                            <p className={"max-w-3xl"}>
                                                <div className={"h-48 overflow-y-scroll"}>
                                                    {htmlFrom(messages[currentSelectedItem].headers.replaceAll("\n", "<br>"))}
                                                </div>
                                            </p>
                                        }
                                    </Tab.Panel>
                                    <Tab.Panel>
                                        {currentSelectedItem === undefined ?
                                            <span>No message selected</span>
                                            :
                                            <p className={"max-w-3xl"}>
                                                        <div>
                                                            { messages[currentSelectedItem].attachments === null ?
                                                                <span>No attachments found.</span>
                                                                :
                                                                <div className={"h-48 overflow-y-scroll"}>
                                                                    {JSON.stringify(messages[currentSelectedItem].attachments)}
                                                                </div>
                                                            }
                                                        </div>
                                            </p>
                                        }
                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>
                        </nav>
                    </div>
                </div>
            </div>
        </Allotment>
    )
}

export default MessagesView;