import { useAtomValue } from 'jotai'
import React from 'react'
import { pathAtom } from '../store/path-store'
import { Circle, Line } from 'react-konva'

export default function PathRender() {
    const points = useAtomValue(pathAtom)
    // Transforme la liste d'IPoint en un tableau de nombres pour Konva
    const flattenedPoints = points.flatMap((point) => [point.x, point.y])

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
            {points.map((point, index) => (
                <Circle
                    key={index}
                    x={point.x}
                    y={point.y}
                    radius={5}
                    fill={'black'}
                />
            ))}
        </>
    )
}
