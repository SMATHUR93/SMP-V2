

import React, { useRef, useState, useEffect, useMemo, useContext } from "react";
import { CarContext } from "./context/CarContext";
import { WorldContext } from "./context/WorldContext";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, OrbitControls, Cylinder, Text, Sphere, RoundedBox, Plane, PerspectiveCamera, Html } from "@react-three/drei";
import { Github, Linkedin, Copy, Check, Mail } from "lucide-react"; // Icons for copy feedback
import { toast, Toaster } from "sonner";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

import { Perf } from 'r3f-perf'

import * as THREE from 'three';

const MAX_RANGE = window.innerWidth * 0.018; // Movement limit
const SPEED = 0.35; // Movement speed
const DAMPING = 0.005; // Damping factor
const WHEEL_ROTATION_SPEED = 0.3;
const GROUND_SPEED = 0.002;
const SEA_SPEED = 0.006;
const CITY_SCAPE_SPEED = 0.002;
const CLOUD_SPEED = 0.003;
const RADIUS = 500; // Cylinder radius
const HEIGHT = 350; // Cylinder radius

const RADIUS_Y = RADIUS + 5;

const camerCood1 = [0, 11, 75];
const camerCood1WidthUnder1000 = [0, 11, 60];
const camerCood2 = [0, 15, 45];
const camerCood3 = [45, 25, 45];

const colors = {
  cream: '#F7EBD4',
  white: '#DAD4F7',
  blue: '#4424D6',
  orange: '#FC600A',
  green: '#B2D732',
  black: '#341809',
  brown: "#8B4513",
  pink: "#FFC0CB",
  red1: '#B8143A',
  red2: '#B82214'
};

const DriverHead = ({ position }) => {
  const hairsTopRef = useRef();// < THREE.Object3D > (null);
  const { pause } = useContext(CarContext);
  let angleHairs = useRef(0);

  useFrame(() => {
    if (hairsTopRef.current && pause == false) {
      hairsTopRef.current.children.forEach((h, i) => {
        h.scale.y = 0.75 + Math.cos(angleHairs.current + i / 3) * 0.25;
      });
      angleHairs.current += 0.16;
    }
  });

  let x = position[0];
  let y = position[1];
  let z = position[2];

  let faceSize = 1.5;

  return (
    <group position={[x, y, z]}>

      <Box args={[faceSize, faceSize, faceSize]}>
        <meshLambertMaterial color={colors.cream} />
      </Box>

      {/* 💇 Hair */}
      <group position={[-faceSize * 0.2, 0.1, 0]}>
        <group ref={hairsTopRef}>
          {Array.from({ length: 12 }).map((_, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            return (
              <Box key={i} args={[faceSize / 2.1, faceSize / 1.8, faceSize]} position={[-0.5 + row * 0.4, 0.5, -0.4 + col * 0.4]}>
                <meshLambertMaterial color={colors.black} />
              </Box>
            );
          })}
        </group>

        {/* 🏷️ Side Hair */}
        <Box args={[1.2, faceSize / 2, 0.3]} position={[0.08, -0.2, -faceSize / 2]}>
          <meshLambertMaterial color={colors.black} />
        </Box>
        <Box args={[1.2, faceSize / 2, 0.3]} position={[0.08, -0.2, faceSize / 2]}>
          <meshLambertMaterial color={colors.black} />
        </Box>

        {/* 🎒 Back Hair */}
        <Box args={[0.2, 1.2, faceSize + 0.1]} position={[-faceSize / 3, -0.4, 0]}>
          <meshLambertMaterial color={colors.black} />
        </Box>

      </group>

      {/* Ears */}
      <Box args={[0.2, 0.3, 0.4]} position={[0, 0, -faceSize / 2]}>
        <meshLambertMaterial color={colors.cream} />
      </Box>
      <Box args={[0.2, 0.3, 0.4]} position={[0, 0, faceSize / 2]}>
        <meshLambertMaterial color={colors.cream} />
      </Box>
    </group>
  );
};

export function Wheel({ position, rotationSpeed }) {
  const wheelRef = useRef();
  const { pause } = useContext(CarContext);

  // Load texture for the tyre
  // const tyreTexture = useLoader(TextureLoader, "/textures/tyre-texture.jpg");

  useFrame(() => {
    if (pause == false) {
      wheelRef.current.rotation.z += -rotationSpeed; // Simulating rolling motion
    }
  });

  return (
    <group ref={wheelRef} position={position}>
      {/* Outer Tyre using Torus */}
      <mesh>
        <torusGeometry args={[2, 0.5]} />
        {/* <meshStandardMaterial map={tyreTexture} /> */}
        <meshStandardMaterial color={colors.black} />
      </mesh>

      {/* Spokes */}
      {[...Array(12)].map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <boxGeometry args={[0.3, 3.5, 0.3]} />
          <meshStandardMaterial color={colors.black} />
        </mesh>
      ))}
    </group>
  );
}

// Car Component
function Car({ direction }) {
  const {
    pause,
    carLights,
    textIndex
  } = useContext(CarContext);
  const carRef = useRef();
  const wheelRefs = useRef([]);
  const [position, setPosition] = useState(0);
  const [rotation, setRotation] = useState(0);

  useFrame(() => {
    if (pause == false) {
      let newPos = position + direction * SPEED;
      if (Math.abs(newPos) > MAX_RANGE) {
        newPos = Math.sign(newPos) * MAX_RANGE; // Keep within bounds
      }

      if (direction == 0 && Math.abs(newPos) > 0.01) {
        newPos *= (1 - DAMPING); // Damp towards zero
      }

      setPosition(newPos);
      setRotation(rotation - direction * SPEED * 5); // Simulate wheel rotation

      carRef.current.position.x = newPos;
      wheelRefs.current.forEach((wheel) => {
        if (wheel) wheel.rotation.y = rotation;
      });
    }
  });

  return (
    <group position={[0, -0.8, 1.5]} ref={carRef} castShadow  >

      {/* 🚙 Jeep Rear */}
      <Cylinder args={[0.4, 0.4, 7]} position={[-6, -2.8, 0]} rotation={[Math.PI / 2, 0, 0]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>
      <RoundedBox args={[6, 3, 7]} radius={0.3} position={[-3, -1.5, 0]} castShadow >
        <meshStandardMaterial color='#B8143A' />
      </RoundedBox>

      {/* 🚗 Jeep Front */}
      <RoundedBox args={[6, 4, 7]} radius={0.5} position={[3, -1, 0]} castShadow >
        <meshStandardMaterial color='#B82214' />

        <Sphere args={[0.3]} position={[3, 1, 2]}>
          <meshStandardMaterial emissive={'#ffff00'} emissiveIntensity={5} color={'#ffff00'} />
          {carLights == true || textIndex > 7 ? <pointLight
            args={['#ffff00', 1, 100, 0.2]}
            position={[0, 0, 0]}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.1}
            shadow-camera-far={100}
            shadow-bias={-0.005}
          /> : <></>}
        </Sphere>

        <Sphere args={[0.3]} position={[3, 1, -2]}>
          <meshStandardMaterial emissive={'#ffff00'} emissiveIntensity={5} color={'#ffff00'} />
          {carLights == true || textIndex > 7 ? <pointLight
            args={['#ffff00', 1, 100, 0.2]}
            position={[0, 0, 0]}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.1}
            shadow-camera-far={100}
            shadow-bias={-0.005}
          /> : <></>}
        </Sphere>
      </RoundedBox>
      <Cylinder args={[0.4, 0.4, 7]} position={[6, -2.8, 0]} rotation={[Math.PI / 2, 0, 0]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>

      {/* <JeepFront args={[60, 40, 70]} position={[30, -10, 0]} /> */}

      {/* 🚗 Wind Shield */}
      <Box args={[0.1, 2, 7]} position={[0.5, 2, 0]}  >
        <meshStandardMaterial color={colors.white} />
      </Box>

      {/* 🚙 Roll Cage / Windshield Frame */}
      <Cylinder args={[0.5, 0.5, 6]} position={[-3, 1.5, 3]} rotation={[0, 0, Math.PI / 2]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>
      <Cylinder args={[0.5, 0.5, 6]} position={[-3, 1.5, -3]} rotation={[0, 0, Math.PI / 2]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>
      <Cylinder args={[0.5, 0.5, 6]} position={[-6, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>

      <group position={[-3, 5, 0]}  >
        <DriverHead position={[0, -0.9, 0]} puase={pause} />

        <Box args={[1, 4, 4]} position={[-2, -3.5, 0]} >
          <meshStandardMaterial color={colors.black} />
        </Box>
        <Cylinder args={[1, 1, 3.7]} position={[0, -3.5, 0]} >
          <meshStandardMaterial color={colors.blue} />
        </Cylinder>
        <Cylinder args={[0.5, 0.5, 2.5]} position={[0, -3, 1.4]} rotation={[0, 0, Math.PI]} >
          <meshStandardMaterial color={colors.blue} />
        </Cylinder>
        <Cylinder args={[0.5, 0.5, 2.5]} position={[0, -3, -1.4]} rotation={[0, 0, Math.PI]} >
          <meshStandardMaterial color={colors.blue} />
        </Cylinder>
        <Cylinder args={[0.5, 0.5, 2]} position={[1, -3.5, 1.5]} rotation={[0, 0, Math.PI / 2]} >
          <meshStandardMaterial color={colors.cream} />
        </Cylinder>
        <Cylinder args={[0.5, 0.5, 2]} position={[1, -3.5, -1.5]} rotation={[0, 0, Math.PI / 2]} >
          <meshStandardMaterial color={colors.cream} />
        </Cylinder>
        <Cylinder args={[1.6, 1.6, 0.9]} position={[2.5, -3.5, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} >
          <meshStandardMaterial color={colors.black} />
        </Cylinder>
      </group>

      {/* <Driver /> */}

      {/* 🔩 Axle Shafts */}
      {[-5, 5].map((x) => (
        <Cylinder key={`shaft-${x}`} args={[0.5, 0.5, 10]} position={[x, -2, 0]} rotation={[Math.PI / 2, 0, 0]} >
          <meshStandardMaterial color={colors.black} />
        </Cylinder>
      ))}

      {[-5, 5].map((x, i) =>
        [-5, 5].map((z, j) => (
          <Wheel
            ref={(el) => (wheelRefs.current[i * 2 + j] = el)}
            key={`${i}-${j}`}
            position={[x, -2, z]}
            rotationSpeed={WHEEL_ROTATION_SPEED}
          />
        ))
      )}
    </group>
  );
}

const Cloud = ({ position = [0, 0, 0], scale = [0, 0, 0], cloudSize = 2 }) => {

  const cloudRef = useRef();

  const numBlocs = 3 + Math.floor(Math.random() * 3); // Between 3 to 5 cubes
  const boxes = new Array(numBlocs).fill().map((_, i) => ({
    position: [i * 0.75, Math.random() * 5, Math.random() * 5],
    rotation: [0, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
    scale: [0.1 + Math.random() * 0.9, 0.1 + Math.random() * 0.9, 0.1 + Math.random() * 0.9],
  }));

  return (
    <group
      key={`${position[0]}-${position[1]}-${position[2]}`}
      ref={cloudRef}
      position={position}
      scale={scale}
    >
      {boxes.map((box, i) => {
        return (
          <mesh>
            <Box
              key={`${position[0]}-${position[1]}-${position[2]}-${i}`}
              args={[cloudSize, cloudSize, cloudSize]}
              position={box.position}
              rotation={box.rotation}
              scale={box.scale}
              castShadow
            >
              <meshPhongMaterial color={0Xffffff} />
            </Box>

          </mesh>
        )
      })}
    </group>
  );
};

const Sky = ({ yAxis, zAxis, cloudSize }) => {
  const skyRef = useRef();
  const { pause } = useContext(CarContext);
  useFrame(() => {
    if (skyRef.current) {
      // skyRef.current.rotation.x += 0.01;
      // skyRef.current.rotation.y += 0.01;
      if (pause == false) {
        skyRef.current.rotation.z += CLOUD_SPEED;
      } else {
        skyRef.current.rotation.z += CLOUD_SPEED / 10;
      }
    }
  });
  const numClouds = 12;
  return (
    <group ref={skyRef} position={[0, yAxis, zAxis]}>
      {Array.from({ length: numClouds }).map((_, i) => {
        const stepAngle = (Math.PI * 2) / numClouds;
        const angle = stepAngle * i;
        const height = RADIUS_Y + 30 + Math.random() * 10;
        const s = 1 + Math.random() * 2;
        return (
          <Cloud
            key={`${i}-${yAxis}-${zAxis}`}
            position={[
              Math.cos(angle) * height,
              Math.sin(angle) * height,
              -30 - Math.random() * 40,
            ]}
            scale={[s, s, s]}
            cloudSize={cloudSize}
          />
        );
      })}
    </group>
  );
};

// Ground Component
function Ground({ positionY = -RADIUS_Y, positionZ = -HEIGHT / 4, radius = RADIUS, height = HEIGHT }) {
  // console.log("Alert:: Ground re-rendering");
  const groundRef = useRef();
  const { pause } = useContext(CarContext);
  useFrame(() => {
    if (groundRef.current && pause == false) {
      groundRef.current.rotation.y += GROUND_SPEED;
    }
  });
  return (
    <Cylinder ref={groundRef}
      position={[0, positionY, positionZ]}
      args={[radius, radius, height, 100]}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#9BD770" />
    </Cylinder>
  );
}

const Sea = ({ positionY = -RADIUS_Y, positionZ = -HEIGHT / 4, radius = RADIUS, height = HEIGHT / 100 }) => {
  const seaRef = useRef();
  const { pause } = useContext(CarContext);

  // Create geometry
  const { geom, waves } = useMemo(() => {
    let geometry = new THREE.CylinderGeometry(radius, radius, height, 40, 10);
    geometry.rotateX(-Math.PI / 2);

    // Convert BufferGeometry and merge vertices
    geometry = mergeVertices(geometry);

    const positions = geometry.attributes.position.array;
    const waves = [];

    for (let i = 0; i < positions.length; i += 3) {
      waves.push({
        y: positions[i + 1],
        ang: Math.random() * Math.PI * 2,
        amp: Math.random() * 1.5,
        speed: 0.016 + Math.random() * 0.032,
      });
    }

    return { geom: geometry, waves: waves };
  }, []);

  // Animate waves
  useFrame(({ clock }) => {
    if (!seaRef.current) {
      return;
    } else {
      const positions = seaRef.current.geometry.attributes.position.array;
      const time = clock.getElapsedTime();

      waves.forEach((wave, i) => {
        positions[i * 3 + 1] = wave.y + Math.sin(time * wave.speed + wave.ang) * wave.amp;
      });

      seaRef.current.geometry.attributes.position.needsUpdate = true;
      if (pause == false) {
        seaRef.current.rotation.z += SEA_SPEED; // Slow sea rotation effect
      } else {
        seaRef.current.rotation.z += SEA_SPEED / 10; // Really Slow sea rotation effect
      }

    }
  });

  return (
    <mesh position={[0, positionY, positionZ]} ref={seaRef} geometry={geom} receiveShadow>
      <meshPhongMaterial color={"#3498db"} transparent opacity={0.8} flatShading />
    </mesh>
  );
};

// Function to create random low-poly buildings
const Building = ({ position, width, height, depth, color }) => {

  let x = position[0];
  let y = position[1];
  let z = position[2];

  const numRows = Math.floor(height / 15);
  const numWindowsPerRow = 2 // Math.floor(width / 150);
  const windowSize = [width / 5, width / 5];

  const windows = useMemo(() => {
    const windowsArray = [];
    // console.log(`width is ${width}`);
    // console.log(`height is ${height}`);
    // console.log(`numRows is ${numRows}`);
    // console.log(`numWindowsPerRow is ${numWindowsPerRow}`);
    // console.log(`windowSize is ${windowSize}`);

    let initX = x - x - 14;
    let initY = -2.25 * y;
    let xInterval = 10;
    let yInterval = 12;
    for (let row = 1; row <= numRows; row++) {
      const yOffset = initY + yInterval * row;
      for (let col = 1; col <= numWindowsPerRow; col++) {
        let xOffset = initX + xInterval * col;
        windowsArray.push({ position: [xOffset, yOffset, depth / 2 + 5] });
      }
    }

    // console.log(windowsArray);
    return windowsArray;
  }, [numRows, numWindowsPerRow, height, depth]);

  return (
    <mesh position={position} castShadow receiveShadow rotation={[0, Math.PI, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
      {windows.map((win, i) => (
        <mesh key={i} position={win.position}>
          <planeGeometry args={windowSize} />
          <meshStandardMaterial color={"#ffffff"} />
        </mesh>
      ))}
    </mesh>
  );
};

const Buildings = ({ position, rotationY }) => {

  const buildingWidth = 20;
  const buildingHeight = 30;
  const buildingDepth = 15;

  const buildings = useMemo(() => {
    const colors = ["#8b5cf6", "#f59e0b", "#84cc16", "#06b6d4", "#ec4899"];
    return Array.from({ length: 3 }).map((_, i) => {
      const width = buildingWidth + Math.random() * buildingWidth;
      const height = buildingHeight + Math.random() * buildingHeight / 2;
      const depth = buildingDepth + Math.random() * buildingDepth;
      const color = colors[i % colors.length];
      return {
        width,
        height,
        depth,
        color,
        position: [
          i * 1.9 * buildingWidth - 2 * buildingWidth,
          height / 2 - height / 3,
          0
        ]
      };
    });
  }, []);

  return (
    <group castShadow receiveShadow position={position} rotation={[Math.PI / 2, 0, -rotationY]}>
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
    </group>
  );
}

// Trees and Bushes Component
function CityScape({ zAxis }) {

  const objectsRef = useRef();
  const { pause } = useContext(CarContext);

  const radius = RADIUS;
  const numObjects = 4;
  useFrame(() => {
    if (objectsRef.current && pause == false) {
      objectsRef.current.rotation.y += CITY_SCAPE_SPEED;
    }
  });

  const objectsRefs = useRef([]);

  return (
    <group ref={objectsRef} position={[0, - RADIUS - 3, -zAxis]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      {
        Array.from({ length: numObjects }).map((_, key) => {
          const angle = (key / numObjects) * Math.PI * 2; // Distribute evenly
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          // Correct outward-facing rotation
          const rotationY = Math.atan2(-z, x) + Math.PI / 2;

          return (<Buildings
            ref={(el) => (objectsRefs.current[key] = el)}
            key={key}
            position={[x, 0, z]}
            rotationY={rotationY}
          />);
        })
      }
    </group>
  );
}

const Tree = ({ position, rotationY }) => {
  let x = position[0];
  let y = position[1];
  let z = position[2];
  return (
    <group position={position} rotation={[Math.PI / 2, 0, -rotationY]} castShadow receiveShadow>
      <Sphere position={[x - x, y - y + 10, z - z]} args={[5, 8]} castShadow receiveShadow>
        <meshStandardMaterial color="#66B032" />
      </Sphere>
      <Cylinder position={[x - x, y - y, z - z]} args={[1, 1, 25]} castShadow receiveShadow>
        <meshStandardMaterial color="#4d1a00" />
      </Cylinder >
    </group>
  );
};

const Bush = ({ position, rotationY }) => {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, -rotationY]} castShadow receiveShadow >
      <Sphere args={[3, 8]} castShadow receiveShadow>
        <meshStandardMaterial color="#375F1B" />
      </Sphere>
    </group>
  );
};

// Trees and Bushes Component
function Environment({ zAxis }) {

  const objectsRef = useRef();
  const { pause } = useContext(CarContext);

  const radius = RADIUS;
  const numObjects = Math.abs(radius / 10);
  useFrame(() => {
    if (objectsRef.current && pause == false) {
      objectsRef.current.rotation.y += CLOUD_SPEED;
    }
  });

  const objectsRefs = useRef([]);

  return (
    <group ref={objectsRef} position={[0, - RADIUS - 3, -zAxis]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      {
        Array.from({ length: numObjects }).map((_, key) => {
          const angle = (key / numObjects) * Math.PI * Math.random() * 10; // Distribute evenly
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          // Correct outward-facing rotation
          const rotationY = Math.atan2(-z, x) + Math.PI / 2;
          const isTree = Math.random() > 0.5;

          return (
            isTree ? (<Tree
              ref={(el) => (objectsRefs.current[key] = el)}
              key={key}
              position={[x, 0, z]}
              rotationY={rotationY}
            />) : (<Bush
              ref={(el) => (objectsRefs.current[key] = el)}
              key={key}
              position={[x, 0, z]}
              rotationY={rotationY}
            />));
        })
      }
    </group>
  );
}

const Sun = ({ sunColor = '#ffff00', positionX = 3 * window.innerWidth, positionY = 0.5 * window.innerWidth, index = 0 }) => {

  const lightConfig = skyPresets[index].light;

  return (
    <Sphere args={[20, 3.2, 3.2]} position={[positionX, positionY, 150]}>
      <meshStandardMaterial emissive={sunColor} emissiveIntensity={5} color={sunColor} />
      <pointLight
        args={[lightConfig.color, lightConfig.intensity * 15, 0, 0.1]}
        position={[positionX, positionY, 0]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.1}
        shadow-camera-far={9500}
        shadow-bias={-0.005}
      />
    </Sphere>
  );
}

const Stars = ({ positionY = HEIGHT * 0.5, positionZ = -2 * HEIGHT, skyRadius = 1.5 * RADIUS, starRadius = 20, noOfStars = 5000 }) => {
  const ref = useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(noOfStars), { radius: skyRadius }));

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group position={[0, positionY, positionZ]} rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled >
        <PointMaterial
          transparent
          color='#ffff00'
          emissive='#ffff00'
          size={starRadius}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const ShootingStar = ({ position, starRadius }) => {
  const ref = useRef();
  const speed = 1.5 + Math.random() * 0.5;
  const [opacity, setOpacity] = useState(1);

  let x = position[0];
  let y = position[1];
  let z = position[2];

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x -= speed * 0.2;
      ref.current.position.y -= speed * 0.01;
      setOpacity((prev) => Math.max(0, prev - Math.random() * 0.01));
      if (opacity <= 0) {
        ref.current.position.set(x, y, z);
        setOpacity(1);
      }
    }
  });

  return (
    <mesh ref={ref} position={position}>

      <mesh>
        <sphereGeometry args={[starRadius, 8, 8]} />
        <meshStandardMaterial color="yellow" emissive="yellow" transparent opacity={opacity} />
      </mesh>
      <mesh position={[starRadius * 7.5, 0, 0]} rotation={[0, 0, Math.PI * 1.5]} >
        <coneGeometry args={[starRadius, starRadius * 15]} />
        <meshStandardMaterial color="yellow" emissive="yellow" transparent opacity={opacity} />
      </mesh>
    </mesh >
  );
};

const ShootingStarField = ({ positionX = HEIGHT, positionY = HEIGHT * 0.5, positionZ = HEIGHT * 0.75, starRadius = 20, noOfStars = 10 }) => {
  return (
    <>
      {Array.from({ length: noOfStars }).map((_, i) => (
        <ShootingStar
          key={i}
          starRadius={starRadius}
          position={[
            Math.random() > 0.5 ? Math.random() * window.innerWidth * 0.35 : - Math.random() * window.innerWidth * 0.35,
            window.innerHeight / 50 + Math.random() * window.innerHeight * 0.2,
            positionZ,
          ]}
        />
      ))}
    </>
  );
};

const Lights = ({ index = 0 }) => {
  const lightConfig = skyPresets[index].light;
  return <directionalLight position={[5, 10, 5]} intensity={lightConfig.intensity} color={lightConfig.color} />;
};

const Background = ({ index = 0 }) => {
  const { scene } = useThree();

  useFrame(() => {
    const colors = skyPresets[index].colors;
    scene.background = new THREE.Color(colors[0]); // Main color
    scene.fog = new THREE.Fog(colors[1], 500, 1500); // Fog for depth effect
  });

  return null;
};

// 🎨 Sky gradient presets & lighting configurations
const skyPresets = [

  { name: "Dawn 0400-0600", colors: ["linear-gradient(to bottom, #FFB75E, #FFA647, #FF7F50, #FF4500)", "#3b4371"], light: { intensity: 0.7, color: "#ffdd44" } },
  { name: "Early Morning 0600-0800", colors: ["#linear-gradient(to bottom, #FFEC82, #FFD700, #FFAA00, #FF8C00)", "#ff9e9e"], light: { intensity: 0.8, color: "#ffdda1" } },
  { name: "Morning Sky 0800-1000", colors: ["linear-gradient(to bottom, #C1E1DC, #84C0C6, #5BADC1, #3182C8)", "#ff9e9e"], light: { intensity: 0.8, color: "#ffdda1" } },
  { name: "Late Morning 1000-1200", colors: ["linear-gradient(to bottom, #87CEEB, #63B8FF, #4682B4, #1E90FF)", "#1E90FF"], light: { intensity: 1, color: "#ffffff" } },
  { name: "Noon 1200-1400", colors: ["linear-gradient(to bottom, #A2C3F1, #6099D8, #2D6CC0, #124BAD)", "#1E90FF"], light: { intensity: 1, color: "#ffffff" } },
  { name: "Afternoon Heat 1400-1600", colors: ["linear-gradient(to bottom, #FFA500, #FF8C00, #FF4500, #B22222)", "#ff3f3f"], light: { intensity: 0.8, color: "#ff7f50" } },
  { name: "Sunset 1600-1800", colors: ["linear-gradient(to bottom, #FFD700, #FFAA00, #FF8C00, #FF4500)", "#ff3f3f"], light: { intensity: 0.6, color: "#ff7f50" } },
  { name: "Dusk 1800-2000", colors: ["linear-gradient(to bottom, #FFA07A, #DC143C, #8B0000, #660000)", "#2b5876"], light: { intensity: 0.4, color: "#654ea3" } },
  { name: "Early Night 2000-2200", colors: ["linear-gradient(to bottom, #003366, #002B55, #001F40, #00122A)", "#2b5876"], light: { intensity: 0.4, color: "#654ea3" } },
  { name: "Midnight 2200-0000", colors: ["linear-gradient(to bottom, #191970, #000080, #00008B, #000033)", "#191654"], light: { intensity: 0.2, color: "#ffffff" } },
  { name: "Deep Night 0000-0200", colors: ["linear-gradient(to bottom, #11002F, #330066, #660099, #9900CC)", "#191654"], light: { intensity: 0.2, color: "#ffffff" } },
  { name: "Pre-Dawn Darkness 0200-0400 ", colors: ["linear-gradient(to bottom, #080808, #0C0C0C, #101010, #141414)", "#191654"], light: { intensity: 0.2, color: "#ffffff" } },
  { name: "Last", colors: ["linear-gradient(to bottom, #000000, #000000, #000000, #000000)", "#3b4371"], light: { intensity: 0.2, color: "#ffdd44" } },
];

/* const skyPresets = [

  { name: "Dawn 5-7", colors: ["linear-gradient(135deg, #f79561, #d5b869, #b4db72, #92fe7a)", "#3b4371"], light: { intensity: 0.5, color: "#ffdd44" } },
  { name: "Early Morning 7-9", colors: ["linear-gradient(135deg, #d6e6ff, #d7f9f8, #fbe0e0, #d3bae3)", "#ff9e9e"], light: { intensity: 0.7, color: "#ffdda1" } },
  { name: "Morning Sky 9-11", colors: ["linear-gradient(135deg, #76e29d, #50dabb, #29d2d8, #03caf6)", "#ff9e9e"], light: { intensity: 0.7, color: "#ffdda1" } },
  { name: "Late Morning 11-13", colors: ["linear-gradient(135deg, #e2416f, #e26869, #e29063, #e2b75d)", "#1E90FF"], light: { intensity: 1, color: "#ffffff" } },
  { name: "Noon 13-15", colors: ["linear-gradient(135deg, #cc9b6d, #f1ca89, #f2dac3, #c8c2bc)", "#1E90FF"], light: { intensity: 1, color: "#ffffff" } },
  { name: "Afternoon Heat 15-17", colors: ["linear-gradient(135deg, #fde992, #ffcc85, #ff8a5b, #d63d24)", "#ff3f3f"], light: { intensity: 0.6, color: "#ff7f50" } },
  { name: "Sunset 17-19", colors: ["linear-gradient(135deg, #344a9c, #306bb3, #2c8aca, #28aae1)", "#ff3f3f"], light: { intensity: 0.6, color: "#ff7f50" } },
  { name: "Dusk 19-21", colors: ["linear-gradient(135deg, #bff5ef, #fad898, #ffeecb, #ebe6ef)", "#2b5876"], light: { intensity: 0.4, color: "#654ea3" } },
  { name: "Early Night 2 21-23", colors: ["linear-gradient(135deg, #13521e, #1f8531, #2bb843, #36eb56)", "#2b5876"], light: { intensity: 0.4, color: "#654ea3" } },
  { name: "Midnight 23-1", colors: ["linear-gradient(135deg, #411bff, #afebe5, #a3d5f0, #d6dfe3)", "#191654"], light: { intensity: 0.2, color: "#ffffff" } },
  { name: "Deep Night 1-3", colors: ["linear-gradient(135deg, #371b58, #4c3575, #5b4b8a, #7858a6)", "#191654"], light: { intensity: 0.2, color: "#ffffff" } },
  { name: "Pre-Dawn Darkness 3-5 ", colors: ["linear-gradient(135deg, #e855a7, #8765e4, #ab4edf, #9d35da)", "#191654"], light: { intensity: 0.2, color: "#ffffff" } },
  { name: "Last", colors: ["linear-gradient(to bottom, #EFEFEF, #AAAAAA, #555555, #000000)", "#3b4371"], light: { intensity: 0.5, color: "#ffdd44" } },
]; */


const texts = [
  "Hi, My Name is Shrey 👋",
  "Welcome to my Little Interactive Portfolio 🤗",
  "I am a full stack developer with UI focus having 10+ years of experience in Software Engineering 👨‍💻",
  "I have worked in enterprise grade software projects for Major firms 👷🏻‍♂️",
  "Started my Journey in 2014 with Cognizant in Banking and Finance Domain 💲",
  "In 2016 I moved to a startup called Eka which provided solutions in commodity and trading domain 🌾",
  "In 2018, I was recruited in Expedia for travel agent affiliate program ✈️",
  "In 2019, I moved to JP Morgan Chase Asset and Wealth Management Division for Connect OS Project 🏦",
  "Since 2021, I have been working in SAP Labs Concur for Invoice Managemant and Payments space. 🧑🏻‍💻",
  "I am an alumni from Rajasthan Technical University (2010-2014)",
  "and Birla Institue of Technology and Science(2022-2024) 🎓",
  "I have worked on multiple front-end & Back-end frameworks and utilites along with vast experience in Cloud Native CI/CD practices.",
  "lets connect to work together and make something cool ✌️ "
];

const pageColors = [
  '#ffffff',
  '#bfc0c0',
  '#d8dbe2',
  '#fffcf2',
  '#ccc5b9',
  '#bfc0c0',
  '#eef0f2',
  '#bed5e8',
  '#a9bcd0',
  '#1f7a8c',
  '#bfdbf7',
  '#e1e5f2',
  '#faf9f9'
];


const MAX_PAGES = 13;

function BackgroundText({ textIndex = 0, textPosition = [0, 20, -30], textRotation = [0, 0, 0] }) {

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // console.log("In BackgroundText, UseEffect");
    setIdx(textIndex);
  }, [textIndex]);

  return (
    <Html position={textPosition} center>
      <div style={{ padding: "10px", borderRadius: "5px", width: '250px', height: '300px' }}>
        <p style={{ textWrap: 'pretty', fontSize: 20, textAlign: 'center' }} className="bg-blue-500 text-white p-4">{texts[idx]}</p>
      </div>
    </Html>
  );
}

function ForegroundText({ textIndex = 0, textPosition = [0, 20, 30], textRotation = [0, Math.PI / 2, 0] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // console.log("In ForegroundText, UseEffect");
    setIdx(textIndex);
  }, [textIndex]);

  return (
    <Html position={textPosition} rotation={textRotation} center>
      <div style={{ padding: "10px", borderRadius: "5px", width: '250px', height: '300px' }}>
        <p style={{ textWrap: 'pretty', fontSize: 20, textAlign: 'center' }} className="bg-blue-500 text-white p-4">{texts[idx]}</p>
      </div>
    </Html>
  );
}


/* function BackgroundPages({ textIndex = 0, pagePosition = [0, 20, -30], pageRotation = [0, 0, 0] }) {

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    console.log("In Pages, UseEffect");
    setIdx(textIndex);
  }, [textIndex]);

  return (
    Array.from({ length: MAX_PAGES }).map((_, currIdx) => {
      return idx == currIdx ? <Plane visible={true} args={[500, 500]} position={pagePosition} rotation={pageRotation} receiveShadow>
        <meshStandardMaterial color={pageColors[idx]} />
      </Plane> : <Plane visible={false} args={[500, 500]} position={pagePosition} rotation={pageRotation} receiveShadow>
        <meshStandardMaterial color={pageColors[idx]} />
      </Plane>;
    })
  );
}; */

/* function ForegroundPages({ textIndex = 0, pagePosition = [-20, 30, 5], pageRotation = [0, Math.PI / 2, 0] }) {

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // console.log("In Pages, UseEffect");
    setIdx(textIndex);
  }, [textIndex]);

  return (
    Array.from({ length: MAX_PAGES }).map((_, currIdx) => {
      return idx == currIdx ? <Plane visible={true} args={[500, 500]} position={pagePosition} rotation={pageRotation} receiveShadow>
        <meshStandardMaterial color={pageColors[idx]} />
      </Plane> : <Plane visible={false} args={[500, 500]} position={pagePosition} rotation={pageRotation} receiveShadow>
        <meshStandardMaterial color={pageColors[idx]} />
      </Plane>;
    })
  );
}; */

const SocialBar = () => {
  const [copied, setCopied] = useState("");

  const socials = [
    { id: "gmail", icon: <Mail size={24} />, link: "shreymathur93@gmail.com" },
    { id: "github", icon: <Github size={24} />, link: "https://github.com/SMATHUR93" },
    { id: "linkedin", icon: <Linkedin size={24} />, link: "https://www.linkedin.com/in/shrey-mathur-43366a86/" },
  ];

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(link);
    toast.success("Link copied to clipboard!");
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="fixed right-5 top-1/3 flex flex-col gap-1 bg-gray-800 p-1 rounded-md shadow-md">
        {socials.map((social) => (
          <button
            key={social.id}
            onClick={() => handleCopy(social.link)}
            className="flex items-center gap-0 p-1 bg-white-500 hover:bg-white-400 rounded-md transition-all"
          >
            {social.icon}
            <Copy size={18} className="text-gray-400" />
          </button>
        ))}
      </div>
    </>
  );
};

const ScreenMessage = () => {
  const { showMessage, setShowMessage } = useContext(WorldContext);

  useEffect(() => {
    const checkScreenSize = () => {
      setShowMessage(window.innerWidth < 768); // Show message if width is less than 768px (tablet/mobile)
    };

    checkScreenSize(); // Run on mount
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!showMessage) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg text-sm shadow-md animate-fadeIn">
      🔍 Best viewed on a larger screen!
    </div>
  );
}

const SceneCamera = ({ targetPosition }) => {

  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3(...targetPosition));

  useEffect(() => {
    camera.fov = 80; // Field of View
    camera.aspect = size.width / size.height; // Aspect Ratio
    camera.near = 0.1; // Near Clipping Plane
    camera.far = 10000; // Far Clipping Plane
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useEffect(() => {
    target.current.set(...targetPosition);
  }, [targetPosition]);

  useFrame(() => {
    camera.position.lerp(target.current, 0.05); // Smooth transition
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// Main Scene
const App = () => {
  const {
    setPause,
    direction,
    setDirection,
    textIndex,
    setTextIndex,
    setCarLights
  } = useContext(CarContext);

  const {
    fogEnabled,
    setFogEnabled,
    starsEnabled,
    setStarsEnabled,
    sunEnabled,
    setSunEnabled,
    ambientLightEnabled,
    setAmbientLightEnabled,
    cameraPosition,
    setCameraPosition,
    showControls,
    setShowControls,
    shootingStarsEnabled,
    setShootingStarsEnabled,
    showMessage
  } = useContext(WorldContext);

  const moveLeft = () => {
    setDirection(-1);
    let prev = textIndex;
    let newVal = textIndex;
    if (prev == 0) {
      newVal = MAX_PAGES - 1;
    } else {
      newVal--;
    }
    setTextIndex(newVal);
  };

  const decelerateFromLeft = () => {
    // console.log(`In decelerateFromLeft direction = ${direction}`);
    // direction.current = 0;
    setDirection(0);
  };

  const decelerateFromRight = () => {
    // console.log(`In decelerateFromRight direction.current = ${direction}`);
    // direction.current = 0;
    setDirection(0);
  };

  const moveRight = () => {
    // console.log(`In moveRight direction.current = ${direction.current}`);
    // direction.current = 1
    setDirection(1);
    let prev = textIndex;
    let newVal = textIndex;
    if (prev == MAX_PAGES - 1) {
      newVal = 0;
    } else {
      newVal++;
    }
    setTextIndex(newVal);
    // console.log(`moveDirection = ${direction} , prev = ${prev} and newVal =  ${newVal}`);
  };

  return (
    <>
      <Canvas style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `${skyPresets[textIndex].colors[0]}` // 'linear-gradient(#DAD4F7, #FFFFFF)'
      }}
        shadows onCreated={({ gl }) => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; }}
      /* camera={{
        position: cameraPosition,
        fov: 80,
        near: 1,
        far: 10000,
        aspect: window.innerWidth / window.innerHeight
      }} */
      >
        <SceneCamera targetPosition={cameraPosition} />
        {/* <Background index={textIndex} /> */}
        {fogEnabled == true ? <fog attach="fog" args={[`${skyPresets[textIndex].colors[1]}`, 100, 300]} /> : <></>}

        {ambientLightEnabled == true || textIndex >= 7 ?
          <ambientLight intensity={0.5} /> :
          <></>
        }
        <Lights index={textIndex} />
        {sunEnabled == true ?
          <Sun sunColor={'#ffff00'} positionX={0.2 * window.innerWidth} positionY={0.05 * window.innerWidth} index={textIndex} /> :
          <></>
        }

        <Sky yAxis={-RADIUS_Y + 25} zAxis={0} cloudSize={3} />
        <Sky yAxis={-RADIUS_Y + 150} zAxis={-350} cloudSize={10} />

        {starsEnabled == true || (textIndex > 7 && textIndex != 12) ?
          <Stars positionY={HEIGHT * 2} positionZ={-5 * HEIGHT} skyRadius={5 * RADIUS} starRadius={3} noOfStars={10000} /> :
          <></>
        }

        {shootingStarsEnabled == true || textIndex == 12 ?
          <ShootingStarField positionX={HEIGHT} positionY={HEIGHT * 2} positionZ={- HEIGHT * 0.75} starRadius={1} noOfStars={25} /> :
          <></>
        }

        <CityScape zAxis={HEIGHT * 0.75} />
        <Environment zAxis={HEIGHT * 0.5} />
        <Environment zAxis={HEIGHT * 0.2} />
        <Ground positionY={-RADIUS_Y} positionZ={- HEIGHT * 0.5 + HEIGHT * 0.1} radius={RADIUS} height={HEIGHT} />
        <Car direction={direction} />
        <Environment zAxis={-HEIGHT * 0.07} />
        <Sea positionY={-RADIUS_Y} positionZ={HEIGHT * 0.2} radius={RADIUS * 0.998} height={HEIGHT / 5} />

        {cameraPosition != camerCood3 ?
          <BackgroundText textIndex={textIndex} textPosition={[0, 30, -30]} textRotation={[0, 0, 0]} /> :
          <></>
        }
        {/* <BackgroundPages textIndex={textIndex} pagePosition={[0, 30, -31]} pageRotation={[0, 0, 0]} /> */}

        {cameraPosition == camerCood3 ?
          <ForegroundText textIndex={textIndex} textPosition={[- window.innerWidth * 0.015, window.innerHeight * 0.015, 5]} textRotation={[0, Math.PI / 2, 0]} /> :
          <></>
        }
        {/* <ForegroundPages textIndex={textIndex} pagePosition={[-21, 30, 5]} pageRotation={[0, Math.PI / 2, 0]} /> */}

        {/* <OrbitControls enableZoom enablePen enableRotate />
        <Perf /> */}

      </Canvas >
      {/* Controls Bar */}
      <div style={{ position: "absolute", width: "100%", textAlign: "center" }} className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-wrap gap-4 bg-gray-800 bg-opacity-80 p-4 rounded-xl shadow-lg">
        {showControls && (
          <>
            <button className="btn-control" onClick={moveLeft} onBlur={() => setDirection(0)}> Left ⬅️ </button>
            <button className="btn-control" onClick={() => setTextIndex(0)}>Restart ⏎</button>
            <button className="btn-control" onClick={() => setPause(prevState => !prevState)}> Play/Pause ⏯️ </button>
            <button className="btn-control" onClick={moveRight} onBlur={() => setDirection(0)}> Right ➡️ </button>
            <button className="btn-control" onClick={() => setCarLights(prevState => !prevState)}> Car Lights 💡</button>

            {!showMessage ? (
              <>
                <button className="btn-control" onClick={() => setFogEnabled(prevState => !prevState)}> Fog 🌁</button>
                <button className="btn-control" onClick={() => setStarsEnabled(prevState => !prevState)}> Stars ✨</button>
                <button className="btn-control" onClick={() => setShootingStarsEnabled(prevState => !prevState)}> Shooting Stars 🌠</button>
                <button className="btn-control" onClick={() => setSunEnabled(prevState => !prevState)}> Sun 🌞 / Moon 🌝</button>
                <button className="btn-control" onClick={() => setAmbientLightEnabled(prevState => !prevState)}> Ambient Light 🔆</button>

                <button className="btn-control" onClick={() => setCameraPosition(camerCood1)}> Camera 1 </button>
                <button className="btn-control" onClick={() => setCameraPosition(camerCood2)}> Camera 2 </button>
                <button className="btn-control" onClick={() => setCameraPosition(camerCood3)}> Camera 3 </button>

                <label className="text-white mt-2 ml-2 text-base font-semibold">{skyPresets[textIndex].name}</label>
              </>
            ) : <></>}

          </>
        )}
        <button
          onClick={() => setShowControls((prev) => !prev)}
          className="btn-control bg-blue-500 text-white px-1 py-1 rounded-md shadow-md hover:bg-blue-700 transition"
        >
          {showControls ? "Hide Controls" : "Show Controls"}
        </button>
      </div>

      {/* Show/Hide Controls Button */}
      <ScreenMessage />
      <SocialBar />
    </>
  );
};

export default App;