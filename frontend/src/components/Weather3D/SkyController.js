import * as THREE from 'three'

export class SkyController {
  constructor(scene, weatherType = 'clear') {
    this.scene = scene
    this.weatherType = weatherType

    const geometry = new THREE.SphereGeometry(100, 64, 64)
    this.material = new THREE.MeshBasicMaterial({ side: THREE.BackSide })
    this.skyMesh = new THREE.Mesh(geometry, this.material)
    scene.add(this.skyMesh)

    this.setWeather(weatherType, {})
  }

  setWeather(weatherType, config) {
    this.weatherType = weatherType

    const configs = {
      clear: {
        topColor: new THREE.Color(0x87ceeb),
        horizonColor: new THREE.Color(0xffd480),
        fog: 100,
      },
      cloudy: {
        topColor: new THREE.Color(0x6b8cae),
        horizonColor: new THREE.Color(0xc0c0c0),
        fog: 60,
      },
      rain: {
        topColor: new THREE.Color(0x4a5f7f),
        horizonColor: new THREE.Color(0x666666),
        fog: 40,
      },
      thunderstorm: {
        topColor: new THREE.Color(0x1a1f3a),
        horizonColor: new THREE.Color(0x333333),
        fog: 30,
      },
      snow: {
        topColor: new THREE.Color(0xb0d0e0),
        horizonColor: new THREE.Color(0xf0f0f0),
        fog: 50,
      },
      fog: {
        topColor: new THREE.Color(0x888888),
        horizonColor: new THREE.Color(0x999999),
        fog: 15,
      },
    }

    const skyConfig = configs[weatherType] || configs.clear

    this.material.color.copy(skyConfig.topColor)

    if (this.scene.fog) {
      this.scene.fog.far = skyConfig.fog
    } else {
      this.scene.fog = new THREE.Fog(skyConfig.topColor, 10, skyConfig.fog)
    }
  }

  update() {
    // Could add time-based sky changes here
  }

  dispose() {
    this.material.dispose()
    this.skyMesh.geometry.dispose()
  }
}
