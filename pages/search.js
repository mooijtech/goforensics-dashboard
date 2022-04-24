/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useState} from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";
import {useAsyncDebounce} from "react-table";
import MessagesView from "../components/messagesview";
import authenticateUser from "../ory/authentication";

export default function Search() {
    const [session, setSession] = useState();
    const [hasSession, setHasSession] = useState(false)

    authenticateUser(setSession, setHasSession);

    const [messages, setMessages] = useState([]);

    const onChange = useAsyncDebounce(event => {
        axios.post(`${process.env.GO_FORENSICS_API_URL}/search`, {"query": event.target.value}, {withCredentials: true}).then((response) => {
            if (response.data === null) {
                setMessages([]);
            } else {
                setMessages(response.data);
            }
        }).catch((error) => {
            if (error.response?.data) {
                alert(error.response.data);
            } else {
                alert(error);
            }
        })
    }, 500)

    return (
        <>
            {hasSession ?
                <Sidebar title={"Search"} session={session}>
                    <div className={"max-w-4xl"}>
                        <div className={"mb-6"}>
                            <label htmlFor="search" className="sr-only">
                                Search query
                            </label>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Enter your search query"
                                onChange={onChange}
                            />
                        </div>

                        {messages === undefined || messages.length === 0 ?
                            <span>No search results found.</span>
                            :
                            <div className={"flex flex-1 flex-col h-screen"}>
                                <MessagesView messages={messages} setMessages={setMessages} padding={false}/>
                            </div>
                        }
                    </div>
                </Sidebar>
                :
                <></>
            }
        </>
    )
}