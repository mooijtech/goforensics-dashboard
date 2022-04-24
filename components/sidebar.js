/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React from "react";
import {Fragment, useState} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {
    MenuIcon,
    XIcon,
} from '@heroicons/react/outline'
import {useRouter} from 'next/router'
import {
    BriefcaseIcon,
    HddIcon,
    SearchIcon,
    BookmarkIcon,
    FileTextIcon,
    UsersIcon,
    PieChartIcon,
    PlugIcon,
    CogIcon,
    QuestionCircleIcon,
    NetworkWiredIcon, FileExportIcon,
} from "react-line-awesome";
import LogoWhiteIcon from "../assets/images/logo-white.svg"

const navigation = [
    {name: "Projects", href: "/projects", icon: BriefcaseIcon},
    {name: "Filesystem", href: "/filesystem", icon: HddIcon},
    {name: "Search", href: "/search", icon: SearchIcon},
    {name: "Bookmarks", href: "/bookmarks", icon: BookmarkIcon},
    {name: "Report", href: "/report", icon: FileTextIcon},
    {name: "Export", href: "/export", icon: FileExportIcon},
    {name: "Network", href: "/network", icon: NetworkWiredIcon},
    {name: "Team", href: "/team", icon: UsersIcon},
    {name: "Statistics", href: "/statistics", icon: PieChartIcon},
    {name: "Integrations", href: "/integrations", icon: PlugIcon},
    {name: "Settings", href: "/settings", icon: CogIcon},
    {name: "Support", href: "/support", icon: QuestionCircleIcon},
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Sidebar({children, title, disableSpacing, session}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog
                    as="div"
                    static
                    className="fixed inset-0 flex z-40 md:hidden"
                    open={sidebarOpen}
                    onClose={setSidebarOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75"/>
                    </Transition.Child>
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-in-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in-out duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="absolute top-0 right-0 -mr-12 pt-2">
                                    <button
                                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="sr-only">Close sidebar</span>
                                        <XIcon className="h-6 w-6 text-white" aria-hidden="true"/>
                                    </button>
                                </div>
                            </Transition.Child>
                            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                                <div className="flex-shrink-0 flex items-center px-4">
                                    <img
                                        className="h-8 w-auto"
                                        src={LogoWhiteIcon}
                                        alt="Go Forensics"
                                    />
                                    <h3 className={"text-white ml-4"}><a href={"/"}>Go Forensics</a></h3>
                                </div>
                                <nav className="mt-5 px-2 space-y-1">
                                    {navigation.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                router.pathname === item.href
                                                    ? 'bg-indigo-800 text-white'
                                                    : 'text-white hover:bg-indigo-600 hover:bg-opacity-75',
                                                'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                                            )}
                                        >
                                            <item.icon className="la la-2x mr-4 flex-shrink-0 text-indigo-300"
                                                       aria-hidden="true"/>
                                            {item.name}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
                                <a href="#" className="flex-shrink-0 group block">
                                    <div className="flex items-center">
                                        <div>
                                            <svg className="inline-block h-9 w-9 rounded-full text-gray-300"
                                                 fill="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-base font-medium text-white">{session?.identity?.traits?.email}</p>
                                            <p className="text-sm font-medium text-indigo-200 group-hover:text-white">View
                                                profile</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </Transition.Child>
                    <div className="flex-shrink-0 w-14" aria-hidden="true">
                        {/* Force sidebar to shrink to fit close icon */}
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden bg-indigo-700 md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex flex-col h-0 flex-1">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <img
                                    className="h-8 w-auto"
                                    src={LogoWhiteIcon}
                                    alt="Go Forensics"
                                />
                                <h3 className={"text-white ml-4"}><a href={"/"}>Go Forensics</a></h3>
                            </div>
                            <nav className="mt-5 flex-1 px-2 space-y-1">
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={classNames(
                                            router.pathname === item.href ? 'bg-indigo-800 text-white' : 'text-white hover:bg-indigo-600 hover:bg-opacity-75',
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                        )}
                                    >
                                        <item.icon className="la la-2x mr-3 flex-shrink-0 text-indigo-300"
                                                   aria-hidden="true"/>
                                        {item.name}
                                    </a>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
                            <a href="#" className="flex-shrink-0 w-full group block">
                                <div className="flex items-center">
                                    <div>
                                        <svg className="inline-block h-9 w-9 rounded-full text-gray-300"
                                             fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-white">{session?.identity?.traits?.email}</p>
                                        <p className="text-xs font-medium text-indigo-200 group-hover:text-white">View
                                            profile</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
                    <button
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <MenuIcon className="h-6 w-6" aria-hidden="true"/>
                    </button>
                </div>
                {disableSpacing ?
                    <div className={"flex flex-1"}>
                        {children}
                    </div>
                    :
                    <main className="relative z-0 overflow-y-auto focus:outline-none">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                            </div>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                                <div className="py-4">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </main>
                }
            </div>
        </div>
    )
}