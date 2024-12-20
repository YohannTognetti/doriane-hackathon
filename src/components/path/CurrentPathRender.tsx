import { useAtomValue } from 'jotai'
import React from 'react'
import { pathAtom } from '../../store/path-store'
import { Circle, Line } from 'react-konva'

export default function CurrentPathRender() {
    const path = useAtomValue(pathAtom)
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
            {path.points.map((point, index) => (
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
