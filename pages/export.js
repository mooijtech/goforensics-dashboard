/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import Sidebar from "../components/sidebar";
import React, {useState} from "react";
import axios from "axios";
import authenticateUser from "../ory/authentication";

export default function Export() {
    const [session, setSession] = useState();
    const [hasSession, setHasSession] = useState(false);

    authenticateUser(setSession, setHasSession);

    const [extensions, setExtensions] = useState("");
    const [exportPath, setExportPath] = useState("");

    return (
        <>
            {hasSession ?
                <Sidebar title={"Export attachments"} session={session}>
                    <div className={"flex flex-col"}>
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                                Attachment extensions (one per line, use "*" for all attachments)
                            </label>
                            <div className="mt-1">
                        <textarea
                            rows={4}
                            name="comment"
                            id="comment"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-96 sm:text-sm border-gray-300 rounded-md"
                            defaultValue={''}
                            placeholder={"doc\nxls"}
                            onChange={(event) => setExtensions(event.target.value)}
                        />
                            </div>
                        </div>

                        {exportPath === "" ?
                            <></>
                            :
                            <p className={"mt-6 text-indigo-500"}>Exported ZIP:
                                <a className={"text-gray-500 hover:underline"} href={`${process.env.GO_FORENSICS_API_URL}/file/${exportPath}`}>
                                    {exportPath}
                                </a>
                            </p>
                        }

                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 mt-6 w-24 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => {
                                if (extensions === "") {
                                    alert("Please enter attachment extensions.")
                                } else {
                                    axios.post(`${process.env.GO_FORENSICS_API_URL}/export`, {extensions: extensions}, {withCredentials: true}).then((response) => {
                                        setExportPath(response.data);
                                        alert("Successfully exported attachments.");
                                    }).catch((error) => {
                                        if (error.response?.data) {
                                            alert(error.response.data)
                                        } else {
                                            alert(error)
                                        }
                                    })
                                }
                            }}
                        >
                            Export
                        </button>
                    </div>
                </Sidebar>
                :
                <></>
            }
        </>
    )
}