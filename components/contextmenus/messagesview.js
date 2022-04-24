/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useState} from "react";
import {Item, Menu, Submenu} from 'react-contexify';
import axios from "axios";
import TagModal from "../modals/tag";
import {toast} from "react-toastify";

export default function ContextMenuMessagesView({currentCheckboxItems, data, setData, removeFromTableOnRemoveBookmark}) {

    const handleAddBookmarks = ({event, props}) => {
        let selectedMessages = []
        let newData = [...data]

        currentCheckboxItems.forEach((value) => {
            selectedMessages.push(data[value].uuid);
            newData[value].bookmark = true;
        });

        axios.post(`${process.env.GO_FORENSICS_API_URL}/bookmarks`, {bookmarks: selectedMessages}, {withCredentials: true}).then((response) => {
            alert(response.data);
        }).catch((error) => {
            if (error.response?.data) {
                alert(error.response.data);
            } else {
                alert(error);
            }
        })

        setData(newData);

        toast.success("Added " + selectedMessages.length + " bookmarks.");
    }

    const handleRemoveBookmarks = ({event, props}) => {
        let selectedCheckboxMessages = []
        let newData = [...data]

        currentCheckboxItems.forEach((value, i) => {
            selectedCheckboxMessages.push(data[value].uuid);

            if (removeFromTableOnRemoveBookmark) {
                newData = newData.filter(oldValue => oldValue.uuid !== data[value].uuid)
            } else {
                newData[value].bookmark = false;
            }
        });

        setData(newData);

        selectedCheckboxMessages.forEach((value, i) => {
            axios.delete(`${process.env.GO_FORENSICS_API_URL}/bookmark/${value}`, {withCredentials: true}).then((response) => {
                alert(response.data);
            }).catch((error) => {
                if (error.response?.data) {
                    alert(error.response.data)
                } else {
                    alert(error);
                }
            })
        })

        toast.success(`Removed ${selectedCheckboxMessages.length} bookmarks.`);
    }
    const handleAddTags = ({event, props}) => {
        if (currentCheckboxItems.length === 0) {
            alert("No messages selected.")
        } else {
            setIsTagModalOpen(true);
        }
    }

    const onAddTag = (tag) => {
        let selectedMessages = []
        let newData = [...data]

        currentCheckboxItems.forEach((value) => {
            selectedMessages.push(data[value].uuid);
            newData[value].tag = tag;
        });

        setData(newData);

        axios.post(`${process.env.GO_FORENSICS_API_URL}/tag`, {messages: selectedMessages}, {withCredentials: true}).then((response) => {
            toast.success(`Added tag to ${currentCheckboxItems.length} messages.`)
        }).catch((error) => {
            if (error.response?.data) {
                alert(error.response.data)
            } else {
                alert(error)
            }
        })
    }

    const handleRemoveTags = ({event, props}) => console.log(event, props);

    const [isTagModalOpen, setIsTagModalOpen] = useState(false);

    return (
        <div>
            <Menu id={"contextMenu"}>
                <Submenu label="Bookmark">
                    <Item onClick={handleAddBookmarks}>Add checked rows</Item>
                    <Item onClick={handleRemoveBookmarks}>Remove checked rows</Item>
                </Submenu>
                <Submenu label="Tag">
                    <Item onClick={handleAddTags}>Add checked rows</Item>
                    <Item onClick={handleRemoveTags}>Remove checked rows</Item>
                </Submenu>
            </Menu>

            <TagModal isTagModalOpen={isTagModalOpen} setIsTagModalOpen={setIsTagModalOpen} onAddTag={onAddTag}/>
        </div>
    )
}