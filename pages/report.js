/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useState} from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";
import authenticateUser from "../ory/authentication";

export default function ReportView() {
    const [session, setSession] = useState();
    const [hasSession, setHasSession] = useState(false)

    authenticateUser(setSession, setHasSession);

    const [downloadURL, setDownloadURL] = useState("");

    const onCreateReport = () => {
        axios.post(`${process.env.GO_FORENSICS_API_URL}/report`, {}, {withCredentials: true}).then((response) => {
            setDownloadURL(`${process.env.GO_FORENSICS_API_URL}/file/` + response.data)
        }).catch((error) => {
            if (error.response?.data) {
                alert(error.response.data)
            } else {
                alert(error)
            }
        })
    }

    return (
        <>
            {hasSession ?
                <Sidebar title={"Report"} session={session}>
                    <div className={"flex flex-col"}>
                        <button
                            type="button"
                            className="inline-flex items-center w-40 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={onCreateReport}
                        >
                            Create HTML report
                        </button>

                        {downloadURL !== "" ?
                            <a className={"text-indigo-500 mt-6"} href={`${downloadURL}`}>{downloadURL}</a>
                            :
                            <></>
                        }
                    </div>
                </Sidebar>
                :
                <></>
            }
        </>
    )
}