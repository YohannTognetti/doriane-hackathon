import { useAtomValue } from 'jotai'
import React from 'react'
import { IItem, managerAtom, plotIdsAtom } from '../store/global-store'
import { selectAtom } from 'jotai/utils'
import _ from 'lodash'
import { IPlotItem } from '../store/plot-store'

export default function Debug() {
    // const manager = useAtomValue(managerAtom)
    // const plot = useAtomValue(plotIdsAtom)

    // console.log('Debug manager', manager)
    // console.log('Debug plot', plot)

    return <></>
}
