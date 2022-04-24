/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useEffect, useState} from "react";
import LogoBlackImage from "../assets/images/logo-black.svg";
import {useRouter} from "next/router";
import authenticateUser from "../ory/authentication";

export default function LoadingView() {
    const [session, setSession] = useState();
    const [hasSession, setHasSession] = useState(false);

    authenticateUser(setSession, setHasSession);

    const router = useRouter();
    const [percentage, setPercentage] = useState(1)

    useEffect(() => {
        if (!hasSession) {
            return;
        }

        const {projectId} = router.query

        if (projectId !== undefined) {
            const source = new EventSource(`${process.env.GO_FORENSICS_API_URL}/outlook/loading?stream=` + projectId)

            source.onmessage = (e) => {
                if (parseInt(e.data) === -1) {
                    router.push("/network")
                } else {
                    setPercentage(e.data)
                }
            }
        }
    }, [hasSession, router.query])

    return (
        <>
            {hasSession ?
                <div className="min-h-screen pt-16 pb-12 flex flex-col bg-white">
                    <main
                        className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex-shrink-0 flex justify-center">
                            <a href="/" className="inline-flex">
                                <span className="sr-only">Go Forensics</span>
                                <img
                                    className="h-12 w-auto"
                                    src={LogoBlackImage}
                                    alt=""
                                />
                            </a>
                        </div>
                        <div className="py-16">
                            <div className="text-center">
                                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Loading</p>
                                <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                                    Importing emails...
                                </h1>
                                <div className={"flex items-center justify-center"}>
                                    <div className="mt-6 relative w-full sm:w-1/2 bg-gray-200 rounded">
                                        <div style={{width: percentage + "%"}}
                                             className="absolute top-0 h-4 rounded shim-blue"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                :
                <></>
            }
        </>
    )
}