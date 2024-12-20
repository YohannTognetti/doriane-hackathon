import { useAtomValue } from 'jotai'
import React, { useMemo } from 'react'
import { Circle, Line } from 'react-konva'
import { managerAtom } from '../../store/global-store'
import { selectAtom } from 'jotai/utils'
import { IPath, PathItem } from '../../store/path-store'

export default function CurrentPathRender(props: { id: string }) {
    const pathItem = useAtomValue(
        useMemo(
            () =>
                selectAtom(managerAtom, (items) => items[props.id] as PathItem),
            [props.id]
        )
    )
    if (!pathItem || pathItem.hidden) {
        return
    }
    const path = pathItem.data
    // Transforme la liste d'IPoint en un tableau de nombres pour Konva
    const flattenedPoints = path.points.flatMap((point) => [point.x, point.y])

    return (
        <>
            <Line
                points={flattenedPoints}
                stroke={'black'}
                strokeWidth={3}
                tension={0} // Ajustez si vous voulez des courbes (tension > 0)
                lineJoin="round"
                closed={false} // Si vous voulez fermer le chemin, mettez `true`
            />
        </>
    )
}
