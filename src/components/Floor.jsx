import { useMemo } from 'react'
import * as THREE from 'three'

export function Floor({ onPlaceKnife, selectedId, onMoveKnife }) {
    const handleClick = (e) => {
        e.stopPropagation()
        const point = e.point

        if (selectedId) {
            onMoveKnife(selectedId, [point.x, 0, point.z])
        } else {
            onPlaceKnife([point.x, 0, point.z])
        }
    }

    const gridTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 512
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, 512, 512)

        ctx.strokeStyle = '#2a2a2a'
        ctx.lineWidth = 1

        for (let i = 0; i <= 512; i += 32) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, 512)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(0, i)
            ctx.lineTo(512, i)
            ctx.stroke()
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(10, 10)

        return texture
    }, [])

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            onClick={handleClick}
            receiveShadow
        >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial map={gridTexture} roughness={0.9} metalness={0.1} />
        </mesh>
    )
}