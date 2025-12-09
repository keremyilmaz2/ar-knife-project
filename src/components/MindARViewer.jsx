import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


// MindAR örnek marker - Hiro marker (test için)
// Gerçek projede kendi marker'ınızı kullanın
const DEFAULT_MARKER = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/examples/image-tracking/assets/card-example/card.mind'

export function MindARViewer({ knifeType, onClose }) {
  const containerRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const mindARRef = useRef(null)
  const [modelScale, setModelScale] = useState(0.5)

  useEffect(() => {
    let mindarThree = null

    const init = async () => {
      try {
        setStatus('loading')

        const markerSrc = DEFAULT_MARKER


        // MindAR başlat
        mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: markerSrc,
          uiLoading: 'no',
          uiScanning: 'no',
          uiError: 'no',
        })

        mindARRef.current = mindarThree

        const { renderer, scene, camera } = mindarThree

        // Renderer ayarları
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.2

        // Işıklandırma - PBR için
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5)
        mainLight.position.set(5, 10, 5)
        mainLight.castShadow = true
        scene.add(mainLight)

        const fillLight = new THREE.DirectionalLight(0xffeedd, 0.6)
        fillLight.position.set(-5, 5, -5)
        scene.add(fillLight)

        const rimLight = new THREE.DirectionalLight(0xaaccff, 0.3)
        rimLight.position.set(0, -5, -10)
        scene.add(rimLight)

        // Environment map için basit bir çözüm
        const pmremGenerator = new THREE.PMREMGenerator(renderer)
        const envScene = new THREE.Scene()
        envScene.background = new THREE.Color(0x888888)
        const envMap = pmremGenerator.fromScene(envScene).texture
        scene.environment = envMap

        // Anchor al (marker bulununca buraya yerleşecek)
        const anchor = mindarThree.addAnchor(0)

        // 3D Model yükle
        const loader = new GLTFLoader()

        const modelPath = knifeType?.model || '/models/santoku/scene.gltf'

        loader.load(
          modelPath,
          (gltf) => {
            const model = gltf.scene

            // Model ayarları - AR için optimize
            const scale = modelScale
            model.scale.set(scale, scale, scale)
            model.rotation.x = Math.PI / 2
            model.rotation.z = Math.PI / 2
            model.position.set(0, 0, 0.05)

            // Metal shader için materyal güncelle
            model.traverse((child) => {
              if (child.isMesh) {
                if (child.material) {
                  child.material.metalness = 0.95
                  child.material.roughness = 0.15
                  child.material.envMapIntensity = 2
                  child.material.needsUpdate = true
                }
              }
            })

            anchor.group.add(model)

            // Animasyon - hafif sallanma
            const animate = () => {
              if (model) {
                model.rotation.y += 0.005
              }
            }
            renderer.setAnimationLoop(() => {
              animate()
              renderer.render(scene, camera)
            })

            setStatus('scanning')
          },
          (progress) => {
            console.log('Model yükleniyor:', (progress.loaded / progress.total * 100).toFixed(0) + '%')
          },
          (err) => {
            console.error('Model yüklenemedi:', err)
            setError('3D model yüklenemedi')
            setStatus('error')
          }
        )

        // Anchor event'leri
        anchor.onTargetFound = () => {
          console.log('Marker bulundu!')
          setStatus('tracking')
        }

        anchor.onTargetLost = () => {
          console.log('Marker kaybedildi')
          setStatus('scanning')
        }

        // AR başlat
        await mindarThree.start()

      } catch (err) {
        console.error('MindAR hatası:', err)
        setError(err.message || 'AR başlatılamadı. Kamera izni verildi mi?')
        setStatus('error')
      }
    }

    init()

    // Cleanup
    return () => {
      if (mindARRef.current) {
        try {
          mindARRef.current.stop()
        } catch (e) {
          console.log('MindAR cleanup:', e)
        }
      }
    }
  }, [knifeType, modelScale])

  const handleScaleUp = () => setModelScale(prev => Math.min(prev + 0.1, 2))
  const handleScaleDown = () => setModelScale(prev => Math.max(prev - 0.1, 0.1))

  return (
    <div className="mindar-container">
      <div ref={containerRef} className="mindar-canvas" />

      {/* Status overlay */}
      <div className="ar-overlay">
        {status === 'loading' && (
          <div className="ar-status">
            <div className="ar-spinner" />
            <p>AR yükleniyor...</p>
            <span className="ar-hint">Kamera izni gerekli</span>
          </div>
        )}

        {status === 'scanning' && (
          <div className="ar-status scanning">
            <div className="ar-scan-icon">📷</div>
            <p>Marker'ı arayın</p>
            <span className="ar-hint">
              Test için şu görseli kullanın:<br />
              <a
                href="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/examples/image-tracking/assets/card-example/card.png"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c41e3a', textDecoration: 'underline' }}
              >
                Marker Görselini Aç
              </a>
            </span>
          </div>
        )}

        {status === 'tracking' && (
          <div className="ar-tracking-badge">
            <span>✓ Takip ediliyor</span>
          </div>
        )}

        {status === 'error' && (
          <div className="ar-status error">
            <div className="ar-error-icon">⚠️</div>
            <p>Hata oluştu</p>
            <span className="ar-hint">{error}</span>
            <button
              onClick={onClose}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: '#c41e3a',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Geri Dön
            </button>
          </div>
        )}
      </div>

      {/* Kapat butonu */}
      <button className="ar-close-btn" onClick={onClose}>
        ✕
      </button>

      {/* Scale kontrolleri */}
      {status === 'tracking' && (
        <div className="ar-scale-controls">
          <button onClick={handleScaleDown}>−</button>
          <span>{(modelScale * 100).toFixed(0)}%</span>
          <button onClick={handleScaleUp}>+</button>
        </div>
      )}

      {/* Bilgi paneli */}
      {status === 'tracking' && knifeType && (
        <div className="ar-info-panel">
          <span className="ar-info-kanji">{knifeType.name}</span>
          <h3>{knifeType.nameEn}</h3>
          <p>{knifeType.steel} • {knifeType.length}</p>
        </div>
      )}
    </div>
  )
}
