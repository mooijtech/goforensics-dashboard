/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import { Configuration, V0alpha2Api } from '@ory/client'
import { edgeConfig } from '@ory/integrations/next'

export default new V0alpha2Api(new Configuration(edgeConfig))