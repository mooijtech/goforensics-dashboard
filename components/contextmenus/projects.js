/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import {Item, Menu, Submenu} from "react-contexify";
import React from "react";

export default function ContextMenuProjects() {
    return (
        <Menu id={"contextMenu"}>
            <Item>Delete checked projects</Item>
        </Menu>
    )
}