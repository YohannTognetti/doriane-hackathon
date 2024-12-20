import { useAtomValue } from 'jotai'
import React from 'react'
import { pathIdsAtom, plotIdsAtom } from '../store/global-store'
import DataAllPlotRender from './PlotRender'
import PathRender from './path/PathRender'

export default function LayerRenderer() {
    return (
        <>
            <PlotsLayer />
            <PathLayer />
        </>
    )
}

function PlotsLayer() {
    const plotIds = useAtomValue(plotIdsAtom)

    return (
        <>
            {plotIds.map((id, index) => (
                <DataAllPlotRender plotId={id} key={id} />
            ))}
        </>
    )
}

function PathLayer() {
    const pathIds = useAtomValue(pathIdsAtom)
    return (
        <>
            {pathIds.map((id, index) => (
                <PathRender id={id} key={id} />
            ))}
        </>
    )
}
