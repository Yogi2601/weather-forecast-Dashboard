import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";


function Sky() {
  return (
    <>
      {/* Sun */}
      <mesh position={[5, 3, -5]}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshBasicMaterial color="#FFD54A" />
      </mesh>

      {/* Ambient Light */}
      <ambientLight intensity={1.8} />

      {/* Directional Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
      />
    </>
  );
}

export default function ThreeWeatherScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 55,
        }}
      >
        <Sky />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}