/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useEffect, useRef, useState} from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";
import dynamic from "next/dynamic";
import {random} from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import moment from "moment";
import authenticateUser from "../ory/authentication";

const SigmaContainer = dynamic(import("react-sigma-v2").then(mod => mod.SigmaContainer), {ssr: false})
const NetworkGraph = dynamic(import("../components/graph").then(mod => mod.NetworkGraph), {ssr: false})
const ControlsContainer = dynamic(import("react-sigma-v2").then(mod => mod.ControlsContainer), {ssr: false})
const SearchControl = dynamic(import("react-sigma-v2").then(mod => mod.SearchControl), {ssr: false})
const ZoomControl = dynamic(import("react-sigma-v2").then(mod => mod.ZoomControl), {ssr: false})
const FullScreenControl = dynamic(import("react-sigma-v2").then(mod => mod.FullScreenControl), {ssr: false})

const NetworkView = () => {
    const [session, setSession] = useState();
    const [hasSession, setHasSession] = useState(false);

    authenticateUser(setSession, setHasSession);

    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [sigma, setSigma] = useState();

    const [firstSentMessageTimestamp, setFirstSentMessageTimestamp] = useState();
    const [lastSentMessageTimestamp, setLastSentMessageTimestamp] = useState();

    const dateRangePickerElement = useRef(undefined);
    const dateRangePickerRef = useRef();

    useEffect(() => {
        if (!hasSession) {
            return;
        }

        axios.get(`${process.env.GO_FORENSICS_API_URL}/network`, {withCredentials: true}).then((response) => {
            if (response.data.nodes === null) {
                alert("No contacts with at least one sent and received message found.")
            } else {
                setNodes(response.data.nodes)
                setLinks(response.data.links)
                setFirstSentMessageTimestamp(response.data.first_sent_message_data)
                setLastSentMessageTimestamp(response.data.last_sent_message_date)
            }
        }).catch((error) => {
            if (error.response?.data) {
                alert(error.response.data)
            } else {
                alert(error);
            }
        });

    }, [hasSession])

    useEffect(() => {
        if (!hasSession) {
            return;
        }

        if (dateRangePickerElement.current !== undefined) {
            import("@themesberg/tailwind-datepicker").then((mod) => {
                dateRangePickerRef.current = new mod.DateRangePicker(dateRangePickerElement.current)
            })

            return () => {
                if (dateRangePickerRef.current) {
                    dateRangePickerRef.destroy();
                }
            }
        }
    }, [hasSession, dateRangePickerElement])

    const randomizePositions = () => {
        const graph = sigma.getGraph();

        random.assign(graph);
        forceAtlas2.assign(graph, {
            iterations: 150,
            settings: {
                gravity: 0,
                adjustSizes: true,
                strongGravityMode: true
            }
        });
    }

    return (
        <>
            {hasSession ?
                <Sidebar title={"Network"} session={session}>
                    {nodes === undefined || nodes === null || nodes.length === 0 ?
                        <span>Loading nodes...</span>
                        :
                        <div>
                            <div ref={dateRangePickerElement} className="flex items-center">
                                <div className="relative">
                                    <div
                                        className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor"
                                             viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                  clip-rule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <input name="start" type="text"
                                           className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                           placeholder="Select date start"/>
                                </div>
                                <span className="mx-4 text-gray-500">to</span>
                                <div className="relative">
                                    <div
                                        className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor"
                                             viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                  clip-rule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <input name="end" type="text"
                                           className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                           placeholder="Select date end"/>
                                </div>
                            </div>

                            <div className={"flex flex-row mb-4"}>
                                {firstSentMessageTimestamp !== undefined ?
                                    <>{moment.unix(firstSentMessageTimestamp).format("DD-MM-YYYY")} to </>
                                    :
                                    <></>
                                }
                                {lastSentMessageTimestamp !== undefined ?
                                    <>{moment.unix(lastSentMessageTimestamp).format("DD-MM-YYYY")}</>
                                    :
                                    <></>
                                }

                            </div>

                            <SigmaContainer style={{height: "700px", width: "1200px"}}>
                                <NetworkGraph nodes={nodes} links={links} setSigma={setSigma}/>

                                <ControlsContainer position={"bottom-right"}>
                                    <ZoomControl/>
                                    <FullScreenControl/>
                                </ControlsContainer>
                                <ControlsContainer position={"top-right"}>
                                    <SearchControl/>
                                </ControlsContainer>

                            </SigmaContainer>

                            <div className={"mt-6"}>
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-2 mr-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={randomizePositions}
                                >
                                    Randomize positions
                                </button>
                            </div>
                        </div>
                    }
                </Sidebar>
                :
                <></>
            }
        </>
    )
}

export default NetworkView;