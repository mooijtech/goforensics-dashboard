/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import { toast } from "react-toastify";

export function handleFlowError(router, flowType, setFlow) {
    return async (error) => {
        switch (error.response?.data.error?.id) {
            case "session_aal2_required":
                // 2FA is enabled and enforced, but user did not perform 2fa yet!
                window.location.href = error.response?.data.redirect_browser_to
                return
            case "session_already_available":
                // User is already signed in, let's redirect them home!
                await router.push("/projects")
                return
            case "session_refresh_required":
                // We need to re-authenticate to perform this action
                window.location.href = error.response?.data.redirect_browser_to
                return
            case "self_service_flow_return_to_forbidden":
                toast.error('The return_to address is not allowed.')
                setFlow(undefined)
                await router.push('/' + flowType)
                return
            case "self_service_flow_expired":
                // The flow expired, let's request a new one.
                toast.error("Your interaction expired, please fill out the form again.")
                setFlow(undefined)
                await router.push("/" + flowType)
                return
            case "security_csrf_violation":
                // A CSRF violation occurred. Best to just refresh the flow!
                toast.error("A security violation was detected, please fill out the form again.")
                setFlow(undefined)
                await router.push("/" + flowType)
                return
            case "security_identity_mismatch":
                // The requested item was intended for someone else. Let's request a new flow...
                setFlow(undefined)
                await router.push("/" + flowType)
                return
            case "browser_location_change_required":
                // Ory Kratos asked us to point the user to this URL.
                window.location.href = error.response.data.redirect_browser_to
                return
        }

        switch (error.response?.status) {
            case 410:
                // The flow expired, let's request a new one.
                setFlow(undefined)
                await router.push("/" + flowType)
                return
        }

        return Promise.reject(error)
    }
}