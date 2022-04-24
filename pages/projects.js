/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useEffect, useMemo, useState} from "react";
import Sidebar from "../components/sidebar";
import CreateImage from "../assets/images/create.svg"
import {Step, Steps, Wizard} from "react-albus";
import UploadImage from "../assets/images/upload.svg"
import TeamImage from "../assets/images/team.svg"
import {DashboardModal} from '@uppy/react'
import axios from "axios";
import {useRouter} from "next/router";
import Table, {DefaultCell} from "../components/table";
import moment from "moment";
import authenticateUser from "../ory/authentication";

const Uppy = require("@uppy/core")
const Tus = require("@uppy/tus")

export default function ProjectsView() {
    const [session, setSession] = useState();
    const [hasSession, setHasSession] = useState(false);

    authenticateUser(setSession, setHasSession);

    const [isProjectsLoading, setIsProjectsLoading] = useState(true);
    const [projects, setProjects] = useState();

    useEffect(() => {
        if (!hasSession) {
            return;
        }

        axios.get(`${process.env.GO_FORENSICS_API_URL}/projects`, {withCredentials: true}).then((response) => {
            setIsProjectsLoading(false);
            setProjects(response.data);
        }).catch((error) => {
            setIsProjectsLoading(false);

            if (error.response?.data) {
                alert(error.response.data);
            } else {
                alert(error);
            }
        })
    }, [hasSession])

    const [projectName, setProjectName] = useState("");
    const [projectUUID, setProjectUUID] = useState("");

    const uppy = useMemo(() => {
        return new Uppy({
            restrictions: {allowedFileTypes: [".pst", ".zip"]},
            onBeforeFileAdded: (currentFile, files) => {
                return {
                    ...currentFile,
                    name: projectUUID + "-" + currentFile.name
                }
            }
        }).use(Tus, {endpoint: `${process.env.TUS_URL}/files`})
    }, [])

    useEffect(() => {
        const fileAddedHandler = (file) => {
            uppy.setFileMeta(file.id, {
                projectUUID: projectUUID
            });
        }

        const uploadHandler = (file, response) => {
            const fileHash = response.uploadURL.replace(`${process.env.TUS_URL}/files/`, "").split("+")[0]
            const fileName = file.name

            axios.post(`${process.env.GO_FORENSICS_API_URL}/evidence`, {
                "file_hash": fileHash,
                "file_name": fileName,
            }, {withCredentials: true}).catch((error) => {
                alert(error.data)
            })
        }

        uppy.on("file-added", fileAddedHandler)
        uppy.on("upload-success", uploadHandler)

        return () => {
            uppy.off("file-added", fileAddedHandler)
            uppy.off("upload-success", uploadHandler)
        }
    }, [projectUUID])

    const [uppyOpen, setUppyOpen] = useState(false);
    const [teamEmails, setTeamEmails] = useState("");

    const [showProjectsWizard, setShowProjectsWizard] = useState(false);

    const router = useRouter();

    const columns = useMemo(
        () => [
            {
                Header: "Name",
                accessor: "name",
                maxWidth: 600,
                minWidth: 40,
                width: 300,
                Cell: DefaultCell
            },
            {
                Header: "Date",
                accessor: "creation_date",
                maxWidth: 600,
                minWidth: 40,
                width: 300,
                Cell: (props) => <div className={"truncate"} style={{
                    width: props.column.width,
                    minWidth: props.column.minWidth
                }}>{moment.unix(props.value).format("dddd, DD MMMM, YYYY")}</div>
            }
        ],
        []
    );

    const [currentCheckboxItems, setCurrentCheckboxItems] = useState([]);
    const [currentSelectedItem, setCurrentSelectedItem] = useState();

    return (
        <div>
            {hasSession ?
                <Sidebar title={"Projects"} session={session}>
                    {isProjectsLoading ?
                        <div>Loading projects...</div>
                        :
                        <>
                            {projects && !showProjectsWizard ?
                                <div className={"max-w-4xl"}>
                                    <div className={"flex flex-1 flex-col"}>
                                        <Table data={projects}
                                               columns={columns}
                                               currentCheckboxItems={currentCheckboxItems}
                                               setCurrentCheckboxItems={setCurrentCheckboxItems}
                                               currentSelectedItem={currentSelectedItem}
                                               setCurrentSelectedItem={setCurrentSelectedItem}
                                               rowHoverTitle={"View project"}
                                               onRowClick={(id) => {
                                                   axios.post(`${process.env.GO_FORENSICS_API_URL}/setProject`, {uuid: projects[id].uuid}, {withCredentials: true}).then((response) => {
                                                       router.push("/filesystem");
                                                   }).catch((error) => {
                                                       if (error.response?.data) {
                                                           alert(error.response.data);
                                                       } else {
                                                           alert(error)
                                                       }
                                                   })
                                               }}
                                               headerChildren={() => {
                                                   return (
                                                       <button
                                                           type="button"
                                                           className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                           onClick={() => {
                                                               setShowProjectsWizard(true);
                                                           }}
                                                       >
                                                           New project
                                                       </button>
                                                   )
                                               }}
                                        />
                                    </div>
                                </div>
                                :
                                <div className={"max-w-sm"}>
                                    <Wizard>
                                        <Steps>
                                            <Step
                                                id="create"
                                                render={({push}) => (
                                                    <div className={"flex flex-col items-center"}>
                                                        <img src={CreateImage} alt={"Create"} width={284}/>

                                                        <label className={"text-lg font-bold mb-px"}>Create your
                                                            project</label>
                                                        <label className={"text-sm mb-3"}>Follow our easy steps to
                                                            create a
                                                            project</label>

                                                        <div>
                                                            <label htmlFor="email" className="sr-only">
                                                                Email
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="email"
                                                                id="email"
                                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-80 sm:text-sm border-gray-300 rounded-md"
                                                                placeholder="Enter project name"
                                                                onChange={(state) => setProjectName(state.target.value)}
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 mt-6 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            onClick={() => {
                                                                if (projectName === "") {
                                                                    alert("Please enter a valid project name.")
                                                                } else {
                                                                    // Create our project
                                                                    axios.post(`${process.env.GO_FORENSICS_API_URL}/projects`, {name: projectName}, {withCredentials: true}).then((response) => {
                                                                        setProjectUUID(response.data.uuid)
                                                                    }).catch((error) => {
                                                                        if (error.response?.data) {
                                                                            alert(error.response.data);
                                                                        } else {
                                                                            alert(error)
                                                                        }
                                                                    });

                                                                    push("upload");
                                                                }
                                                            }}
                                                        >
                                                            Continue
                                                        </button>

                                                        <label className={"mt-6 text-sm"}>1 / 3</label>
                                                    </div>
                                                )}
                                            />
                                            <Step
                                                id="upload"
                                                render={({push}) => (
                                                    <div className={"flex flex-col items-center"}>
                                                        <img src={UploadImage} alt={"Upload"} width={284}/>

                                                        <label className={"text-lg font-bold mb-px"}>Upload your
                                                            evidence</label>
                                                        <label className={"text-sm mb-3"}>Follow our easy steps to
                                                            create a
                                                            project</label>

                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-4 py-2 w-80 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            onClick={() => {
                                                                setUppyOpen(true)
                                                            }}
                                                        >
                                                            Click here to upload evidence
                                                        </button>

                                                        <DashboardModal uppy={uppy} open={uppyOpen}
                                                                        showLinkToFileUploadResult={false}
                                                                        proudlyDisplayPoweredByUppy={false}
                                                                        onRequestClose={() => setUppyOpen(false)}/>

                                                        <div className={"mt-6"}>
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-3 py-2 mr-3 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                onClick={() => {
                                                                    setUppyOpen(false);
                                                                    setProjectName("");
                                                                    push("create")
                                                                }}
                                                            >
                                                                Back
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                onClick={() => {
                                                                    push("team")
                                                                }}
                                                            >
                                                                Continue
                                                            </button>
                                                        </div>

                                                        <label className={"mt-6 text-sm"}>2 / 3</label>

                                                    </div>
                                                )}
                                            />
                                            <Step
                                                id="team"
                                                render={({push}) => (
                                                    <div className={"flex flex-col items-center"}>
                                                        <img src={TeamImage} alt={"Team"} width={364}/>

                                                        <label className={"text-lg font-bold mb-px"}>Invite your
                                                            team</label>
                                                        <label className={"text-sm mb-3"}>Follow our easy steps to
                                                            create a
                                                            project</label>

                                                        <textarea
                                                            id="team"
                                                            name="team"
                                                            rows={3}
                                                            className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                                                            defaultValue={''}
                                                            placeholder={"Enter one email per line (optional)"}
                                                            onChange={(event) => setTeamEmails(event.target.value)}
                                                        />

                                                        <div className={"mt-6"}>
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-3 py-2 mr-3 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                onClick={() => {
                                                                    push("upload")
                                                                }}
                                                            >
                                                                Back
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                onClick={() => {
                                                                    router.push("/filesystem")
                                                                }}
                                                            >
                                                                Finish
                                                            </button>
                                                        </div>

                                                        <label className={"mt-6 text-sm"}>3 / 3</label>
                                                    </div>
                                                )}
                                            />
                                        </Steps>
                                    </Wizard>
                                </div>
                            }
                        </>
                    }
                </Sidebar>
                :
                <></>
            }
        </div>
    )
}