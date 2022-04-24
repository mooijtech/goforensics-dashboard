/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import Sidebar from "../components/sidebar";
import React, {useEffect, useState} from "react";
import axios from "axios";
import MessagesView from "../components/messagesview";
import authenticateUser from "../ory/authentication";

export default function BookmarksView() {
    const [session, setSession] = useState();
    const [hasSession, setHasSession] = useState(false);

    authenticateUser(setSession, setHasSession);

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!hasSession) {
            return
        }

        axios.get(`${process.env.GO_FORENSICS_API_URL}/bookmarks`, {withCredentials: true}).then((response) => {
            setMessages(response.data);
        }).catch((error) => {
            if (error.response?.data) {
                alert(error.response.data);
            } else {
                alert(error)
            }
        })
    }, [])

    return (
        <>
            {hasSession ?
                <Sidebar title={"Bookmarks"} session={session}>
                    {messages === null || messages.length === 0 ?
                        <span>No bookmarks found.</span>
                        :
                        <div className={"flex flex-1 h-screen"}>
                            <MessagesView messages={messages} setMessages={setMessages} removeFromTableOnRemoveBookmark={true}/>
                        </div>
                    }
                </Sidebar>
                :
                <></>
            }
        </>
    )
}