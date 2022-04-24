import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import ory from "../../ory";
import {handleFlowError} from "../../ory/errors";

export default function Integrations() {
    const router = useRouter();

    const [flow, setFlow] = useState();
    const {flow: flowId, return_to: returnTo, integration} = router.query

    useEffect(() => {
        if (!router.isReady || flow) {
            return
        }

        if (flowId) {
            ory.getSelfServiceRegistrationFlow(String(flowId)).then(({data}) => {
                setFlow(data);
                handleAuthenticated();
            }).catch(handleFlowError(router, "integrations/" + integration, setFlow))
        } else {
            ory.initializeSelfServiceRegistrationFlowForBrowsers("/integrations/" + integration).then(({data}) => {
                setFlow(data)
            }).catch((error) => {
                if (error.response?.data.error?.id === "session_already_available") {
                    handleAuthenticated();
                } else {
                    return handleFlowError(router, "integrations/" + integration, setFlow)
                }
            })
        }
    }, [flowId, router, router.isReady, returnTo, flow])

    useEffect(() => {
        if (!router.isReady || !flow) {
            return
        }

        if (integration === "outlook") {
            handleIntegrateOutlook();
        } else {
            alert("Unsupported integration: " + integration)
        }
    }, [flow])

    const handleAuthenticated = () => {
        // The user is authenticated, update their information for IMAP.
        // Ory Kratos currently doesn't support a second OAuth2 request with
        // a different scope to the same provider to update the traits so we do this ourselves.
        router.push(process.env.GO_FORENSICS_API_URL + "/integration/" + integration)
    }

    const handleIntegrateOutlook = () => {
        router.push(`/integrations/${integration}?flow=${flow?.id}`, undefined, {shallow: true}).then(() =>
            ory.submitSelfServiceRegistrationFlow(String(flow?.id), {
                csrf_token: flow?.ui?.nodes?.[0]?.attributes?.value,
                method: "oidc",
                provider: integration,
            }).catch(
                handleFlowError(router, "integrations/" + integration, setFlow)
            ).catch((error) => {
                // If the previous handler did not catch the error it's most likely a form validation error.
                if (error.response?.status === 400) {
                    setFlow(error.response?.data)
                    return
                }

                return Promise.reject(error)
            })
        )
    }

    return (
        <div className="bg-white min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
            <div className="max-w-max mx-auto">
                <main className="sm:flex">
                    <p className="text-4xl font-extrabold text-indigo-600 sm:text-5xl capitalize">{integration}</p>
                    <div className="sm:ml-6">
                        <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Redirecting to integration...</h1>
                            <p className="mt-1 text-base text-gray-500">You should be redirected shortly, if not, please contact us.</p>
                        </div>
                        <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                            <a
                                href={`${process.env.GO_FORENSICS_WEBSITE_URL}/contact`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Contact support
                            </a>
                            <a
                                href={process.env.GO_FORENSICS_WEBSITE_URL}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Go back home
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}