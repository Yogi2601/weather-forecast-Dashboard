import * as THREE from 'three'

export class CloudSystem {
  constructor(scene, windSpeed = 0) {
    this.scene = scene
    this.clouds = []
    this.windSpeed = windSpeed
    this.time = 0

    this.createClouds()
  }

  createClouds() {
    const cloudCount = 6
    const positions = [
      { x: -12, y: 8, z: -8 },
      { x: 10, y: 9, z: -10 },
      { x: -6, y: 10, z: -5 },
      { x: 14, y: 7.5, z: -12 },
      { x: -18, y: 9.5, z: -6 },
      { x: 8, y: 8.5, z: -8 },
    ]

    positions.forEach((pos) => {
      const cloud = this.createCloudMesh(pos)
      this.clouds.push(cloud)
      this.scene.add(cloud)
    })
  }

  createCloudMesh(position) {
    const cloudGroup = new THREE.Group()
    cloudGroup.position.set(position.x, position.y, position.z)

    // Create more, smaller spheres for fluffy cloud look
    const sphereCount = 8 + Math.random() * 4
    for (let i = 0; i < sphereCount; i++) {
      const size = Math.random() * 0.3 + 0.15
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(size, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xf0f0f0,
          emissive: 0xffffff,
          emissiveIntensity: 0.15,
          metalness: 0.1,
          roughness: 0.9,
          transparent: true,
          opacity: 0.85,
        })
      )
      sphere.castShadow = true
      sphere.receiveShadow = true
      sphere.position.x = (Math.random() - 0.5) * 1.5
      sphere.position.y = (Math.random() - 0.5) * 0.8
      sphere.position.z = (Math.random() - 0.5) * 1.2
      cloudGroup.add(sphere)
    }

    return cloudGroup
  }

  setMovementSpeed(windSpeed) {
    this.windSpeed = windSpeed
  }

  update() {
    this.time += 0.016

    this.clouds.forEach((cloud, i) => {
      // More responsive wind speed
      const moveSpeed = (this.windSpeed / 40) * 0.15 + 0.03
      cloud.position.x += moveSpeed

      if (cloud.position.x > 25) {
        cloud.position.x = -25
      }

      // Subtle vertical bobbing
      cloud.position.y += Math.sin(this.time * 0.3 + i) * 0.003

      // Slight side-to-side sway
      cloud.position.z += Math.sin(this.time * 0.2 + i * 0.5) * 0.002
    })
  }

  dispose() {
    this.clouds.forEach(cloud => {
      cloud.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    })
  }
}
