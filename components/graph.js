/**
 * This file is part of Go Forensics (https://www.goforensics.io/)
 * Copyright (C) 2022 Marten Mooij (https://www.mooijtech.com/)
 */
import React, {useEffect, useState} from "react";
import {useSigma, useSetSettings, useRegisterEvents} from "react-sigma-v2";
import {random} from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import noverlap from "graphology-layout-noverlap";

// References:
// https://github.com/sim51/react-sigma-v2
// https://graphology.github.io/
export const NetworkGraph = ({nodes, links, setSigma}) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const registerEvents = useRegisterEvents();
    const setSettings = useSetSettings();
    const [hoveredNode, setHoveredNode] = useState();
    let draggedNode = null;
    let isDragging = false;

    useEffect(() => {
        nodes.forEach((node) => {
            if (!graph.hasNode(node.id)) {
                graph.addNode(node.id, { label: node.id, color: "#4338CA", size: node.size + 10 });
            }
        })
        links.forEach((link) => {
            if (!graph.hasEdge(link.target, link.source)) {
                graph.addEdge(link.target, link.source, { color: "#6B7280", size: 1 });
            }
        })
    }, [nodes, links])

    useEffect(() => {
        setSettings({
            nodeReducer: (node, data) => {
                const newData = { ...data, highlighted: data.highlighted || false };

                if (hoveredNode) {
                    if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
                        newData.highlighted = true;
                    } else {
                        newData.color = "#A5B4FC";
                        newData.highlighted = false;
                    }
                }
                return newData;
            },
            edgeReducer: (edge, data) => {
                const graph = sigma.getGraph();
                const newData = { ...data, hidden: false };

                if (hoveredNode && !graph.extremities(edge).includes(hoveredNode)) {
                    newData.hidden = true;
                }
                return newData;
            },
        });
    }, [hoveredNode])

    useEffect(() => {
        setSigma(sigma);

        random.assign(graph);
        forceAtlas2.assign(graph, {
            iterations: 200,
            settings: {
                gravity: 0,
                adjustSizes: true,
                strongGravityMode: true
            }
        });
        noverlap.assign(graph, {
            settings: {
                margin: 20
            },
        });

        registerEvents({
            enterNode: event => setHoveredNode(event.node),
            leaveNode: () => setHoveredNode(null),
        });

        sigma.on("downNode", (e) => {
            isDragging = true;
            draggedNode = e.node;

            sigma.getCamera().disable();
        });

        sigma.getMouseCaptor().on("mousemove", (e) => {
            if (!isDragging || !draggedNode) return;

            const pos = sigma.viewportToGraph(e);

            graph.setNodeAttribute(draggedNode, "x", pos.x);
            graph.setNodeAttribute(draggedNode, "y", pos.y);
        });

        sigma.getMouseCaptor().on("mouseup", () => {
            isDragging = false;
            draggedNode = null;

            sigma.getCamera().enable();
        });

        sigma.getMouseCaptor().on("mousedown", () => {
            if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
        });
    }, [])

    return null;
}