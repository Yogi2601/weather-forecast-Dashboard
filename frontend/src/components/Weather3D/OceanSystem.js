import * as THREE from 'three'

export class OceanSystem {
  constructor(scene) {
    this.scene = scene
    this.time = 0
    this.waveIntensity = 0.3

    const geometry = new THREE.PlaneGeometry(100, 100, 128, 128)
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a5c7a,
      metalness: 0.7,
      roughness: 0.2,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.x = -Math.PI / 2.5
    this.mesh.position.y = -2
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    this.originalPositions = this.geometry.attributes.position.array.slice()
  }

  setWaveIntensity(intensity) {
    this.waveIntensity = intensity
  }

  update() {
    this.time += 0.016

    const positions = this.geometry.attributes.position.array
    const originalPositions = this.originalPositions

    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositions[i]
      const z = originalPositions[i + 2]

      // More pronounced wave patterns
      const wave1 = Math.sin(x * 0.12 + this.time * 1.5) * 0.5
      const wave2 = Math.sin(z * 0.1 + this.time * 1.0) * 0.4
      const wave3 = Math.sin((x + z) * 0.06 + this.time * 1.8) * 0.3
      const wave4 = Math.sin((x - z) * 0.05 + this.time * 1.2) * 0.2

      // Increased amplitude for more visible waves
      positions[i + 1] = originalPositions[i + 1] + (wave1 + wave2 + wave3 + wave4) * this.waveIntensity * 1.5
    }

    this.geometry.attributes.position.needsUpdate = true
    this.geometry.computeVertexNormals()
  }

  get geometry() {
    return this.mesh.geometry
  }

  dispose() {
    this.geometry.dispose()
    this.mesh.material.dispose()
  }
}
