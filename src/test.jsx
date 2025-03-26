import { useMemo, useRef } from "react";
import { MeshStandardMaterial } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Cylinder, Sphere, Plane } from "@react-three/drei";
import * as THREE from 'three';
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils";


function RotatingObjects() {
     const radius = 50;
     const numObjects = 8;

     return (
          <group rotation={[Math.PI / 2, 0, 0]} >
               {Array.from({ length: numObjects }).map((_, i) => {
                    const angle = (i / numObjects) * Math.PI * 2; // Distribute evenly
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;

                    // Correct outward-facing rotation
                    const rotationY = Math.atan2(-z, x) + Math.PI / 2;

                    return <RotatedObject key={i} position={[x, 10, z]} rotationY={rotationY} />;
               })}
          </group>
     );
}

function RotatedObject({ position, rotationY }) {
     // Rotate to face the center
     // const center = new THREE.Vector3(100, 0, 0);


     const buildings = useMemo(() => {
          const colors = ["#8b5cf6", "#f59e0b", "#84cc16", "#06b6d4", "#ec4899"];
          return Array.from({ length: 5 }).map((_, i) => {
               const width = Math.random() * 2 + 1.5;
               const height = Math.random() * 4 + 3;
               const depth = Math.random() * 2 + 1.5;
               const color = colors[i % colors.length];
               const windows = Array.from({ length: Math.floor(height) }).map((_, j) => ({
                    position: [0, j - height / 2 + 0.5, depth / 2 + 0.01],
                    size: [width * 0.4, 0.4],
                    color: "#ffffff",
               }));
               return { width, height, depth, color, position: [i * 3 - 6, height / 2, 0], windows };
          });
     }, []);

     return (
          <group castShadow position={position} rotation={[Math.PI / 2, 0, -rotationY]}>
               {buildings.map((b, i) => (
                    <Building key={i} {...b} />
               ))}
          </group>
     );
}


// Function to create random low-poly buildings
const Building = ({ position, width, height, depth, color, windows }) => {
     return (
          <mesh position={position} castShadow receiveShadow>
               <boxGeometry args={[width, height, depth]} />
               <meshStandardMaterial color={color} />
               {windows.map((win, i) => (
                    <mesh key={i} position={win.position}>
                         <planeGeometry args={win.size} />
                         <meshStandardMaterial color={win.color} />
                    </mesh>
               ))}
          </mesh>
     );
};

const Sun = ({ sunColor = '#ffff00', positionX = 0, positionY = 0.5 * window.innerWidth }) => {
     return (
          <Sphere args={[1, 32, 32]} position={[positionX, positionY, 10]}>
               <meshStandardMaterial emissive={sunColor} emissiveIntensity={5} color="orange" />
               <pointLight
                    args={[sunColor, 15, 0, 0.1]}
                    position={[positionX, positionY, 0]}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-near={0.1}
                    shadow-camera-far={100}
                    shadow-bias={-0.005}
               />
          </Sphere>
     );
}

const Sea = () => {
     const seaRef = useRef();

     // Create geometry
     const { geom, waves } = useMemo(() => {
          let geometry = new THREE.CylinderGeometry(60, 60, 80, 400, 10);
          geometry.rotateX(-Math.PI / 2);

          // Convert BufferGeometry and merge vertices
          geometry = mergeVertices(geometry);

          const positions = geometry.attributes.position.array;
          console.log(positions);
          const waves = [];

          for (let i = 0; i < positions.length; i += 3) {
               waves.push({
                    y: positions[i + 1],
                    ang: Math.random() * Math.PI * 2,
                    amp: Math.random() * 1,
                    speed: 0.016 + Math.random() * 0.032,
               });
          }

          return { geom: geometry, waves: waves };
     }, []);

     // Animate waves
     useFrame(({ clock }) => {
          if (!seaRef.current) return;
          const positions = seaRef.current.geometry.attributes.position.array;
          const time = clock.getElapsedTime();

          waves.forEach((wave, i) => {
               positions[i * 3 + 1] = wave.y + Math.sin(time * wave.speed + wave.ang) * wave.amp;
          });

          seaRef.current.geometry.attributes.position.needsUpdate = true;
          seaRef.current.rotation.z += 0.005; // Slow sea rotation effect
     });

     return (
          <mesh position={[0, 80, 0]} ref={seaRef} geometry={geom} receiveShadow>
               <meshPhongMaterial color={"#3498db"} transparent opacity={0.8} flatShading />
          </mesh>
     );
};

// Scene containing multiple buildings
const TestingScene = () => {
     const buildings = useMemo(() => {
          const colors = ["#8b5cf6", "#f59e0b", "#84cc16", "#06b6d4", "#ec4899"];
          return Array.from({ length: 5 }).map((_, i) => {
               const width = Math.random() * 2 + 1.5;
               const height = Math.random() * 4 + 3;
               const depth = Math.random() * 2 + 1.5;
               const color = colors[i % colors.length];
               const windows = Array.from({ length: Math.floor(height) }).map((_, j) => ({
                    position: [0, j - height / 2 + 0.5, depth / 2 + 0.01],
                    size: [width * 0.4, 0.4],
                    color: "#ffffff",
               }));
               return { width, height, depth, color, position: [i * 3 - 6, height / 2, 0], windows };
          });
     }, []);

     return (
          <Canvas
               style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(#DAD4F7, #FFFFFF)'
               }}
               shadows camera={{ position: [0, 180, 80], fov: 100 }}>
               {/* <ambientLight intensity={0.5} />
               <directionalLight position={[5, 10, 5]} castShadow /> */}
               {buildings.map((b, i) => (
                    <Building key={i} {...b} />
               ))}
               <Sun sunColor={'#ffff00'} positionX={0} positionY={200} />
               <Plane args={[500, 500]} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <meshStandardMaterial color="#efefef" />
               </Plane>
               {/* <RotatingObjects /> */}
               <Sea />
               <OrbitControls enableZoom enablePen enableRotate />
          </Canvas>
     );
};

export default TestingScene;