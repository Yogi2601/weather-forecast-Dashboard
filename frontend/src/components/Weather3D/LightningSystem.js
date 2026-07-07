import * as THREE from 'three'

export class LightningSystem {
  constructor(scene) {
    this.scene = scene
    this.active = false
    this.light = new THREE.PointLight(0xffffcc, 0, 50)
    this.light.position.set(5, 10, 0)
    scene.add(this.light)

    this.nextLightningTime = this.getRandomLightningDelay()
    this.time = 0
    this.lightningIntensity = 0
  }

  setActive(active) {
    this.active = active
    if (!active) {
      this.light.intensity = 0
      this.lightningIntensity = 0
    }
  }

  getRandomLightningDelay() {
    return Math.random() * 3000 + 1000
  }

  update() {
    if (!this.active) {
      this.light.intensity = 0
      return
    }

    this.time += 16

    if (this.time > this.nextLightningTime) {
      this.triggerLightning()
      this.nextLightningTime = this.time + this.getRandomLightningDelay()
    }

    if (this.lightningIntensity > 0) {
      this.lightningIntensity -= 0.08
      // Add flicker effect for more realism
      if (Math.random() < 0.3) {
        this.light.intensity = this.lightningIntensity * (0.5 + Math.random() * 0.5)
      } else {
        this.light.intensity = this.lightningIntensity
      }
    }
  }

  triggerLightning() {
    this.lightningIntensity = 3 + Math.random() * 2
    this.light.position.set(
      (Math.random() - 0.5) * 30,
      Math.random() * 8 + 12,
      (Math.random() - 0.5) * 20
    )
  }

  dispose() {
    this.scene.remove(this.light)
  }
}
