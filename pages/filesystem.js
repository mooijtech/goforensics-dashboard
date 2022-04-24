/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useEffect, useMemo, useState} from 'react'
import Sidebar from "../components/sidebar";
import axios from "axios";
import DropdownTreeSelect from "react-dropdown-tree-select";

import MessagesView from "../components/messagesview";
import authenticateUser from "../ory/authentication";

export default function FilesystemView() {
    const [session, setSession] = useState();
    const [hasSession, setHasSession] = useState(false);

    authenticateUser(setSession, setHasSession);

    const [treeNodes, setTreeNodes] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!hasSession) {
            return;
        }

        axios.get(`${process.env.GO_FORENSICS_API_URL}/tree`, {withCredentials: true}).then((response) => {
            setTreeNodes(response.data);
        }).catch((error) => {
            alert(error.response.data)
            setTreeNodes([]);
        })
    }, [])

    const dropDownTreeSelect = useMemo(() => {
        const onChange = (currentNode, selectedNodes) => {
            const selectedUUIDs = selectedNodes.map((selectedNode) => selectedNode.value)

            axios.post(`${process.env.GO_FORENSICS_API_URL}/search`, {
                "treeNodeUUIDs": selectedUUIDs
            }, {withCredentials: true}).then((response) => {
                if (response.data == null) {
                    setMessages([])
                } else {
                    setMessages(response.data);
                }
            }).catch((error) => {
                setMessages([]);
            });
        }

        return <DropdownTreeSelect data={treeNodes} onChange={onChange} texts={{placeholder: "Search"}}
                                   showDropdown={"always"}/>
    }, [treeNodes])

    return (
        <>
            {hasSession ?
                <Sidebar disableSpacing={true} session={session}>
                    <main className="flex-1 flex overflow-hidden">
                        <div className="flex-1 flex xl:overflow-hidden">
                            {/* Primary column */}
                            <section
                                aria-labelledby="primary-heading"
                                className="min-w-0 flex-1 h-full flex flex-col overflow-hidden relative lg:order-last"
                            >
                                <h1 id="primary-heading" className="sr-only">
                                    Messages
                                </h1>

                                {messages.length === 0 ?
                                    <span className={"p-4"}>No tree nodes selected.</span>
                                    :
                                    <MessagesView messages={messages} setMessages={setMessages} padding={true}/>
                                }
                            </section>

                            {/* Secondary column (only shown on large screens) */}
                            <aside className="lg:block lg:flex-shrink-0 lg:order-first sm:hidden hidden">
                                <div className="h-full relative flex flex-col w-96 border-r border-gray-200 bg-white">
                                    <div
                                        className="flex flex-col flex-grow border-r border-gray-200 pt-5 pb-4 bg-white overflow-y-auto">
                                        <div className="flex items-center flex-shrink-0 px-4">
                                            <h2 className={"text-lg"}>Filesystem</h2>
                                        </div>
                                        <div className="mt-3 flex-grow flex flex-col">
                                            <nav className="flex-1 px-4 space-y-1 bg-white" aria-label="Sidebar">
                                                {dropDownTreeSelect}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </main>
                </Sidebar>
                :
                <></>
            }
        </>
    )
}
