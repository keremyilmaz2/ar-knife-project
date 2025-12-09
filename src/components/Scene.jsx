import { Environment, OrbitControls, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'
import { Knife } from './Knife'
import { Floor } from './Floor'

export function Scene({ knives, onPlaceKnife, selectedId, onSelectKnife, onMoveKnife, viewMode, knifeTypes }) {
    return (
        <>
            <Suspense fallback={null}>
                <Environment preset="studio" />
            </Suspense>

            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
            <directionalLight position={[-5, 10, -5]} intensity={0.5} color="#ffeedd" />

            <Floor
                onPlaceKnife={onPlaceKnife}
                selectedId={selectedId}
                onMoveKnife={onMoveKnife}
            />

            <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.4}
                scale={50}
                blur={2}
                far={10}
            />

            {knives.map((knife) => {
                const knifeData = knifeTypes[knife.type]
                return (
                    <Knife
                        key={knife.id}
                        position={knife.position}
                        scale={knife.scale || 4}
                        rotation={knife.rotation || 0}
                        isSelected={selectedId === knife.id}
                        onSelect={() => onSelectKnife(knife.id)}
                        viewMode={viewMode}
                        modelPath={knifeData?.model || '/models/santoku/scene.gltf'}
                        baseScale={knifeData?.baseScale || 1}
                        rotationFix={knifeData?.rotationFix || [Math.PI / 2, 0, 0]}
                    />
                )
            })}

            <OrbitControls
                enabled={!selectedId}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={5}
                maxDistance={50}
            />

            <gridHelper args={[50, 50, '#333333', '#222222']} position={[0, 0.01, 0]} />
        </>
    )
}