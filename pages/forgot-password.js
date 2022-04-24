/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useEffect, useState} from "react";
import LogoBlackIcon from "../assets/images/logo-black.svg"
import {useRouter} from "next/router";
import ory from "../ory"
import {handleFlowError} from "../ory/errors";

export default function ForgotPassword() {
    const [email, setEmail] = useState();

    const router = useRouter();
    const {flow: flowId, return_to: returnTo} = router.query

    const [flow, setFlow] = useState();

    useEffect(() => {
        if (!router.isReady || flow) {
            return
        }

        if (flowId) {
            ory.getSelfServiceRecoveryFlow(String(flowId)).then(({data}) => {
                setFlow(data)
            }).catch(
                handleFlowError(router, "forgot-password", setFlow)
            )
        } else {
            ory.initializeSelfServiceRecoveryFlowForBrowsers().then(({data}) => {
                setFlow(data)
            }).catch(
                handleFlowError(router, "forgot-password", setFlow)
            ).catch((error) => {
                // If the previous handler did not catch the error it's most likely a form validation error.
                if (error.response?.status === 400) {
                    setFlow(error.response?.data)
                    return
                }

                return Promise.reject(error)
            })
        }
    }, [flowId, router, router.isReady, returnTo, flow])

    const onSubmit = () => {
        router.push(`/forgot-password?flow=${flow?.id}`, undefined, {shallow: true}).then(() =>
            ory.submitSelfServiceRecoveryFlow(String(flow?.id), undefined, {
                csrf_token: getCSRFToken(),
                email: email,
                method: "link"
            }).then(({data}) => {
                setFlow(data)
            }).catch(
                handleFlowError(router, "forgot-password", setFlow)
            ).catch((error) => {
                switch (error.response?.status) {
                    case 400:
                        // Status code 400 implies the form validation had an error.
                        setFlow(error.response?.data)
                        return
                }

                throw error
            })
        )
    }

    const getCSRFToken = () => {
        return flow?.ui?.nodes?.filter((value) => value.attributes.name === "csrf_token")?.[0]?.attributes.value
    }

    const getGlobalMessage = () => {
        return flow?.ui?.messages?.[0]?.text
    }

    const getGlobalError = () => {
        return flow?.error?.reason
    }

    const getEmailError = () => {
        return flow?.ui?.nodes?.filter((value) => value.attributes.name === "email")?.[0]?.messages?.[0]?.text
    }

    return (
        <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <img
                    className="mx-auto h-12 w-auto"
                    src={LogoBlackIcon}
                    alt="Go Forensics"
                />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        login to your account
                    </a>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        {getGlobalMessage() ?
                            <span className={"text-green-600"}>{getGlobalMessage()}</span>
                            :
                            <></>
                        }
                        {getGlobalError() ?
                            <div className={"text-red-600"}>{flow.error.reason}</div>
                            :
                            <></>
                        }

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            </div>

                            <div className={"mt-4"}>
                                {getEmailError() ?
                                    <span className={"text-red-600"}>{getEmailError()}</span>
                                    :
                                    <></>
                                }
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={onSubmit}
                            >
                                Reset password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}