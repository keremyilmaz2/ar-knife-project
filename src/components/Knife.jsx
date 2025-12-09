import { useGLTF, Center } from '@react-three/drei'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VIEW_MODES = {
    NORMAL: 'normal',
    WIREFRAME: 'wireframe',
    XRAY: 'xray'
}

export function Knife({
    position = [0, 0, 0],
    scale = 4,
    rotation = 0,
    isSelected,
    onSelect,
    viewMode = 'normal',
    modelPath = '/models/santoku/scene.gltf',
    baseScale = 1,
    rotationFix = [Math.PI / 2, 0, 0]
}) {
    const { scene } = useGLTF(modelPath)
    const clonedScene = useMemo(() => scene.clone(), [scene])
    const ringRef = useRef()
    const glowRef = useRef()

    useEffect(() => {
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                if (viewMode === VIEW_MODES.WIREFRAME) {
                    child.material = new THREE.MeshBasicMaterial({
                        color: '#c41e3a',
                        wireframe: true,
                        transparent: true,
                        opacity: 0.8
                    })
                } else if (viewMode === VIEW_MODES.XRAY) {
                    child.material = new THREE.MeshNormalMaterial({
                        transparent: true,
                        opacity: 0.85,
                        side: THREE.DoubleSide
                    })
                } else {
                    const originalScene = scene.clone()
                    originalScene.traverse((origChild) => {
                        if (origChild.isMesh && origChild.name === child.name) {
                            child.material = origChild.material.clone()
                        }
                    })
                }
            }
        })
    }, [viewMode, clonedScene, scene])

    useFrame((state) => {
        if (ringRef.current && isSelected) {
            ringRef.current.rotation.z = state.clock.elapsedTime * 0.5
        }
        if (glowRef.current && isSelected) {
            glowRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15
        }
    })

    const handleClick = (e) => {
        e.stopPropagation()
        onSelect()
    }

    // Toplam scale = kullanıcı scale * model base scale
    const totalScale = scale * baseScale

    return (
        <group position={position} onClick={handleClick}>
            <group rotation={[0, rotation, 0]} scale={totalScale}>
                <Center>
                    <primitive
                        object={clonedScene}
                        rotation={rotationFix}
                    />
                </Center>
            </group>

            {isSelected && (
                <>
                    <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                        <ringGeometry args={[totalScale * 1.3, totalScale * 2, 64]} />
                        <meshBasicMaterial color="#c41e3a" transparent opacity={0.3} side={THREE.DoubleSide} />
                    </mesh>

                    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                        <ringGeometry args={[totalScale * 1.4, totalScale * 1.5, 64]} />
                        <meshBasicMaterial color="#c41e3a" transparent opacity={0.9} side={THREE.DoubleSide} />
                    </mesh>

                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                        <ringGeometry args={[totalScale * 1.2, totalScale * 1.25, 64]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
                    </mesh>
                </>
            )}
        </group>
    )
}