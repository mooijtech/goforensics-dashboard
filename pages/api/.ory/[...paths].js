/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
// @ory/integrations offers a package for integrating with NextJS.
import {config, createApiHandler} from '@ory/integrations/next-edge'

export {config}

// Note: Set the ORY_SDK_URL
export default createApiHandler({})
