import * as THREE from 'three'

export class SnowSystem {
  constructor(scene) {
    this.scene = scene
    this.active = false
    this.particleCount = 300
    this.time = 0

    this.createSnowParticles()
  }

  createSnowParticles() {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(this.particleCount * 3)
    const velocities = new Float32Array(this.particleCount * 3)

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = Math.random() * 25 + 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30

      velocities[i * 3] = (Math.random() - 0.5) * 0.15
      velocities[i * 3 + 1] = -(Math.random() * 0.15 + 0.08)
      velocities[i * 3 + 2] = 0
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  setActive(active) {
    this.active = active
    this.particles.visible = active
  }

  update() {
    if (!this.active) return

    this.time += 0.016

    const positions = this.particles.geometry.attributes.position.array
    const velocities = this.particles.geometry.attributes.velocity.array

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] += velocities[i * 3]
      positions[i * 3 + 1] += velocities[i * 3 + 1]

      // Gentle swaying motion
      positions[i * 3] += Math.sin(this.time + i) * 0.008
      positions[i * 3 + 2] += Math.cos(this.time * 0.5 + i) * 0.006

      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = Math.random() * 25 + 20
        positions[i * 3] = (Math.random() - 0.5) * 50
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true
  }

  dispose() {
    this.particles.geometry.dispose()
    this.particles.material.dispose()
  }
}
