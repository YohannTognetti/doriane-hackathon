import React, { useRef, useState } from 'react'
import { Image } from 'react-konva'

export default function FieldRender(props: { width: number; height: number }) {
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const baseSize = props.width

    React.useEffect(() => {
        const img = new window.Image()
        img.src = '/images/image.png' // URL de l'image
        img.onload = () => {
            setImage(img) // Mettre à jour l'état lorsque l'image est chargée
        }
    }, [])

    return (
        image && (
            <Image
                id="field"
                image={image}
                width={image.width * 2}
                height={image.height * 2}
            />
        )
    )
}
