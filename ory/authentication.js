import {useEffect, useState} from "react";
import ory from "../ory"
import {useRouter} from "next/router";

export default function authenticateUser(setSession, setHasSession) {
    const router = useRouter();

    useEffect(() => {
        ory.toSession().then(({data}) => {
            setSession(data)
            setHasSession(true);
        }).catch((error) => {
            switch (error.response?.status) {
                case 403:
                // This is a legacy error code thrown. See code 422 for more details.
                case 422:
                    // This status code is returned when we are trying to
                    // validate a session which has not yet completed
                    // its second factor.
                    return router.push("/login?aal=aal2")
                case 401:
                    // The user is not logged in.
                    return router.push("/login")
            }

            return Promise.reject(error)
        })
    }, [])
}