

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, OrbitControls, Cylinder, Text, Sphere, RoundedBox, Plane, PerspectiveCamera, Html } from "@react-three/drei";
import { Perf } from 'r3f-perf'

import * as THREE from 'three';

const MAX_RANGE = 150; // Movement limit
const SPEED = 1.9; // Movement speed
const WHEEL_ROTATION_SPEED = 0.25;
const PERSPECTIVE_SPEED = 0.04;
const CLOUD_SPEED = 0.005;
const RADIUS = 5000; // Cylinder radius
const HEIGHT = 2300; // Cylinder radius

const RADIUS_Y = RADIUS + 50;

const camerCood1 = [0, 110, 600];
const camerCood1WidthUnder1000 = [0, 110, 600];
const camerCood2 = [0, 150, 450];
const camerCood3 = [300, 150, 300];

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
  let angleHairs = useRef(0);

  useFrame(() => {
    if (hairsTopRef.current) {
      hairsTopRef.current.children.forEach((h, i) => {
        h.scale.y = 0.75 + Math.cos(angleHairs.current + i / 3) * 0.25;
      });
      angleHairs.current += 0.16;
    }
  });

  let x = position[0];
  let y = position[1];
  let z = position[2];

  let faceSize = 15;

  return (
    <group position={[x, y, z]}>

      <Box args={[faceSize, faceSize, faceSize]}>
        <meshLambertMaterial color={colors.cream} />
      </Box>

      {/* 💇 Hair */}
      <group position={[-faceSize / 5, 1, 0]}>
        <group ref={hairsTopRef}>
          {Array.from({ length: 12 }).map((_, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            return (
              <Box key={i} args={[faceSize / 2.1, faceSize / 1.8, faceSize]} position={[-4 + row * 4, 5, -4 + col * 4]}>
                <meshLambertMaterial color={colors.black} />
              </Box>
            );
          })}
        </group>

        {/* 🏷️ Side Hair */}
        <Box args={[12, faceSize / 2, 3]} position={[0.8, -0.2, -faceSize / 2]}>
          <meshLambertMaterial color={colors.black} />
        </Box>
        <Box args={[12, faceSize / 2, 3]} position={[0.8, -0.2, faceSize / 2]}>
          <meshLambertMaterial color={colors.black} />
        </Box>

        {/* 🎒 Back Hair */}
        <Box args={[2, 8, faceSize + 1]} position={[-faceSize / 3, -0.4, 0]}>
          <meshLambertMaterial color={colors.black} />
        </Box>

      </group>

      {/* Ears */}
      <Box args={[2, 3, 4]} position={[0, 0, -faceSize / 2]}>
        <meshLambertMaterial color={colors.cream} />
      </Box>
      <Box args={[2, 3, 4]} position={[0, 0, faceSize / 2]}>
        <meshLambertMaterial color={colors.cream} />
      </Box>
    </group>
  );
};

export function Wheel({ position, rotationSpeed }) {
  const wheelRef = useRef();

  // Load texture for the tyre
  // const tyreTexture = useLoader(TextureLoader, "/textures/tyre-texture.jpg");

  useFrame(() => {
    wheelRef.current.rotation.z += -rotationSpeed; // Simulating rolling motion
  });

  return (
    <group ref={wheelRef} position={position}>
      {/* Outer Tyre using Torus */}
      <mesh>
        <torusGeometry args={[20, 5]} />
        {/* <meshStandardMaterial map={tyreTexture} /> */}
        <meshStandardMaterial color={colors.black} />
      </mesh>

      {/* Spokes */}
      {[...Array(12)].map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <boxGeometry args={[3, 35, 3]} />
          <meshStandardMaterial color={colors.black} />
        </mesh>
      ))}
    </group>
  );
}

// Car Component
function Car({ direction }) {
  const carRef = useRef();
  const wheelRefs = useRef([]);
  const [position, setPosition] = useState(0);
  const [rotation, setRotation] = useState(0);

  useFrame(() => {
    let newPos = position + direction.current * SPEED;
    if (Math.abs(newPos) > MAX_RANGE) {
      newPos = Math.sign(newPos) * MAX_RANGE; // Keep within bounds
    }

    /* if (direction.current === 0 && Math.abs(newPos) > 0.01) {
      newPos *= (1 - DAMPING); // Damp towards zero
    } */

    setPosition(newPos);
    setRotation(rotation - direction.current * SPEED * 5); // Simulate wheel rotation

    carRef.current.position.x = newPos;
    wheelRefs.current.forEach((wheel) => {
      if (wheel) wheel.rotation.y = rotation;
    });
  });

  return (
    <group position={[0, -7, 0]} ref={carRef} castShadow  >

      {/* 🚙 Jeep Rear */}
      <Cylinder args={[4, 4, 70]} position={[-60, -25, 0]} rotation={[Math.PI / 2, 0, 0]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>
      <RoundedBox args={[60, 30, 70]} radius={3} position={[-30, -15, 0]} castShadow >
        <meshStandardMaterial color='#B8143A' />
      </RoundedBox>

      {/* 🚗 Jeep Front */}
      <RoundedBox args={[60, 40, 70]} radius={5} position={[30, -10, 0]} castShadow >
        <meshStandardMaterial color='#B82214' />

        <Sphere args={[3]} position={[30, 10, 20]}>
          <meshStandardMaterial emissive={'#ffff00'} emissiveIntensity={5} color={'#ffff00'} />
          <pointLight
            args={['#ff0000', 10, 0, 0.3]}
            position={[0, 0, 0]}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.1}
            shadow-camera-far={100}
            shadow-bias={-0.005}
          />
        </Sphere>

        <Sphere args={[3]} position={[30, 10, -20]}>
          <meshStandardMaterial emissive={'#ffff00'} emissiveIntensity={5} color={'#ffff00'} />
          <pointLight
            args={['#ff0000', 10, 0, 0.3]}
            position={[0, 0, 0]}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.1}
            shadow-camera-far={100}
            shadow-bias={-0.005}
          />
        </Sphere>
      </RoundedBox>
      <Cylinder args={[4, 4, 70]} position={[60, -25, 0]} rotation={[Math.PI / 2, 0, 0]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>

      {/* <JeepFront args={[60, 40, 70]} position={[30, -10, 0]} /> */}

      {/* 🚗 Wind Shield */}
      <Box args={[1, 20, 70]} position={[5, 20, 0]}  >
        <meshStandardMaterial color={colors.white} />
      </Box>

      {/* 🚙 Roll Cage / Windshield Frame */}
      <Cylinder args={[5, 5, 60]} position={[-30, 15, 30]} rotation={[0, 0, Math.PI / 2]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>
      <Cylinder args={[5, 5, 60]} position={[-30, 15, -30]} rotation={[0, 0, Math.PI / 2]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>
      <Cylinder args={[5, 5, 60]} position={[-60, 15, 0]} rotation={[Math.PI / 2, 0, 0]}  >
        <meshStandardMaterial color={colors.black} />
      </Cylinder>

      <group position={[-30, 50, 0]}  >
        <DriverHead position={[0, -9, 0]} />

        <Box args={[10, 40, 40]} position={[-20, -35, 0]} >
          <meshStandardMaterial color={colors.black} />
        </Box>
        <Cylinder args={[10, 10, 37]} position={[0, -35, 0]} >
          <meshStandardMaterial color={colors.blue} />
        </Cylinder>
        <Cylinder args={[5, 5, 25]} position={[0, -30, 14]} rotation={[0, 0, Math.PI]} >
          <meshStandardMaterial color={colors.blue} />
        </Cylinder>
        <Cylinder args={[5, 5, 25]} position={[0, -30, -14]} rotation={[0, 0, Math.PI]} >
          <meshStandardMaterial color={colors.blue} />
        </Cylinder>
        <Cylinder args={[5, 5, 20]} position={[10, -35, 15]} rotation={[0, 0, Math.PI / 2]} >
          <meshStandardMaterial color={colors.cream} />
        </Cylinder>
        <Cylinder args={[5, 5, 20]} position={[10, -35, -15]} rotation={[0, 0, Math.PI / 2]} >
          <meshStandardMaterial color={colors.cream} />
        </Cylinder>
        <Cylinder args={[16, 16, 9]} position={[25, -35, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} >
          <meshStandardMaterial color={colors.black} />
        </Cylinder>
      </group>

      {/* <Driver /> */}

      {/* 🔩 Axle Shafts */}
      {[-50, 50].map((x) => (
        <Cylinder key={`shaft-${x}`} args={[5, 5, 100]} position={[x, -20, 0]} rotation={[Math.PI / 2, 0, 0]} >
          <meshStandardMaterial color={colors.black} />
        </Cylinder>
      ))}

      {[-50, 50].map((x, i) =>
        [-50, 50].map((z, j) => (
          <Wheel
            ref={(el) => (wheelRefs.current[i * 2 + j] = el)}
            key={`${i}-${j}`}
            position={[x, -20, z]}
            rotationSpeed={WHEEL_ROTATION_SPEED}
          />
        ))
      )}
    </group>
  );
}

const Cloud = ({ position = [0, 0, 0], scale = [0, 0, 0], cloudSize = 20 }) => {

  const cloudRef = useRef();

  const numBlocs = 3 + Math.floor(Math.random() * 3); // Between 3 to 5 cubes
  const boxes = new Array(numBlocs).fill().map((_, i) => ({
    position: [i * 7.5, Math.random() * 10, Math.random() * 10],
    rotation: [0, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
    scale: [0.1 + Math.random() * 0.9, 0.1 + Math.random() * 0.9, 0.1 + Math.random() * 0.9],
  }));

  return (
    <group ref={cloudRef} position={position} scale={scale}>
      {boxes.map((box, i) => {
        return (
          <mesh>
            <Box
              key={i}
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
  useFrame(() => {
    if (skyRef.current) {
      // skyRef.current.rotation.x += 0.01;
      // skyRef.current.rotation.y += 0.01;
      skyRef.current.rotation.z += CLOUD_SPEED;
    }
  });
  const numClouds = 25;
  return (
    <group ref={skyRef} position={[0, yAxis, zAxis]}>
      {Array.from({ length: numClouds }).map((_, i) => {
        const stepAngle = (Math.PI * 2) / numClouds;
        const angle = stepAngle * i;
        const height = RADIUS_Y + 300 + Math.random() * 150;
        const s = 1 + Math.random() * 2;
        return (
          <Cloud
            key={i}
            position={[
              Math.cos(angle) * height,
              Math.sin(angle) * height,
              -300 - Math.random() * 400,
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
function Ground({ positionY = -RADIUS_Y, radius = RADIUS }) {
  // console.log("Alert:: Ground re-rendering");
  const groundRef = useRef();
  useFrame(() => {
    if (groundRef.current) {
      groundRef.current.rotation.y += PERSPECTIVE_SPEED;
    }
  });
  return (
    <Cylinder ref={groundRef}
      position={[0, positionY, -HEIGHT / 4]}
      args={[radius, radius, HEIGHT, 100]}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#9BD770" />
    </Cylinder>
  );
}

function generateObjects(count, radius) {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2; //  angle = (Math.PI * 4 * i) / count;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const rotationY = Math.atan2(-z, x) + Math.PI / 2;
    return {
      key: i,
      position: [x, 0, z],
      isTree: Math.random() > 0.5,
      rotationY: rotationY
    };
  });
}

const Tree = ({ position, rotationY }) => {
  let x = position[0];
  let y = position[1];
  let z = position[2];
  return (
    <group position={position} rotation={[Math.PI / 2, 0, -rotationY]} castShadow receiveShadow>
      <Sphere position={[x - x, y - y + 50, z - z]} args={[40, 80]} castShadow receiveShadow>
        <meshStandardMaterial color="#66B032" />
      </Sphere>
      <Cylinder position={[x - x, y - y, z - z]} args={[10, 10, 150]} castShadow receiveShadow>
        <meshStandardMaterial color="#4d1a00" />
      </Cylinder >
    </group>
  );
};

const Bush = ({ position, rotationY }) => {
  let x = position[0];
  let y = position[1];
  let z = position[2];
  return (
    <group position={position} rotation={[Math.PI / 2, 0, -rotationY]} castShadow receiveShadow >
      <Sphere args={[30, 80]} castShadow receiveShadow>
        <meshStandardMaterial color="#375F1B" />
      </Sphere>
    </group>
  );
};

// Trees and Bushes Component
function Environment({ zAxis }) {
  const objects = generateObjects(Math.abs(zAxis / 5), RADIUS);
  // console.log(objects);

  const objectsRef = useRef();
  const radius = RADIUS;
  const numObjects = Math.abs(zAxis / 10);
  useFrame(() => {
    if (objectsRef.current) {
      objectsRef.current.rotation.y += CLOUD_SPEED;
    }
    /* objectsRefs.current.forEach((object) => {
      if (object) {
        object.rotation.z += 0.005;
      }
    }); */
  });

  const objectsRefs = useRef([]);

  return (
    <group ref={objectsRef} position={[0, - RADIUS - 30, -zAxis]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      {
        Array.from({ length: numObjects }).map((_, key) => {
          const angle = (key / numObjects) * Math.PI * Math.random() * 10; // Distribute evenly
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          // Correct outward-facing rotation
          const rotationY = Math.atan2(-z, x) + Math.PI / 2;
          const isTree = Math.random() > 0.5;

          /* return <RotatedObject key={i} position={[x, 0, z]} rotationY={rotationY} />; */


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

const Sun = ({ sunColor = '#ffff00', positionX = 3 * window.innerWidth, positionY = 0.5 * window.innerWidth }) => {
  return (
    <Sphere args={[200, 32, 32]} position={[positionX, positionY, 4500]}>
      <meshStandardMaterial emissive={sunColor} emissiveIntensity={5} color={sunColor} />
      <pointLight
        args={[sunColor, 11, 0, 0.1]}
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
  "I am an alumni from Rajasthan Technical University (2010-1014)",
  "and Birla Institue of Technology and Science(2022-204) 🎓",
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

function BackgroundText({ textIndex = 0, textPosition = [0, 200, -300], textRotation = [0, 0, 0] }) {

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    console.log("In BackgroundText, UseEffect");
    setIdx(textIndex);
  }, [textIndex]);

  /* return (
    <mesh position={textPosition} rotation={textRotation}>
      <Text fontSize={50} color={colors.black}>
        {texts[idx]}
      </Text>
      <meshStandardMaterial color={colors.black} />
    </mesh>
  ); */
  return (
    <Html position={textPosition} center>
      <div style={{ padding: "10px", borderRadius: "5px", width: '250px', height: '300px' }}>
        <p style={{ textWrap: 'pretty', fontSize: 20, textAlign: 'center' }}>{texts[idx]}</p>
      </div>
    </Html>
  );
}

function ForegroundText({ textIndex = 0, textPosition = [0, 200, 300], textRotation = [0, Math.PI / 2, 0] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    console.log("In ForegroundText, UseEffect");
    setIdx(textIndex);
  }, [textIndex]);

  return (
    <mesh position={textPosition} rotation={textRotation}>
      <Text fontSize={50} color={colors.black}>
        {texts[idx]}
      </Text>
      <meshStandardMaterial color={colors.black} />
    </mesh>
  );
}


/* function BackgroundPages({ textIndex = 0, pagePosition = [0, 200, -300], pageRotation = [0, 0, 0] }) {

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

function ForegroundPages({ textIndex = 0, pagePosition = [-200, 300, 50], pageRotation = [0, Math.PI / 2, 0] }) {

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
};

// Main Scene
const App = () => {
  const direction = useRef(0); // 0 = stop, 1 = right, -1 = left
  const [textIndex, setTextIndex] = useState(0);

  const moveLeft = () => {
    console.log(`In moveleft direction.current = ${direction.current}`);
    direction.current = -1;
    let prev = textIndex;
    let newVal = textIndex;
    if (prev == 0) {
      newVal = MAX_PAGES - 1;
    } else {
      newVal--;
    }
    setTextIndex(newVal);
    console.log(`moveDirection = ${direction.current} , prev = ${prev} and newVal =  ${newVal}`);
  };

  const decelerateFromLeft = () => {
    console.log(`In decelerateFromLeft direction.current = ${direction.current}`);
    direction.current = 0;
  };

  const decelerateFromRight = () => {
    console.log(`In decelerateFromRight direction.current = ${direction.current}`);
    direction.current = 0;
  };

  const moveRight = () => {
    console.log(`In moveRight direction.current = ${direction.current}`);
    direction.current = 1
    let prev = textIndex;
    let newVal = textIndex;
    if (prev == MAX_PAGES - 1) {
      newVal = 0;
    } else {
      newVal++;
    }
    setTextIndex(newVal);
    console.log(`moveDirection = ${direction.current} , prev = ${prev} and newVal =  ${newVal}`);
  };

  return (
    <>
      <Canvas style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(#DAD4F7, #FFFFFF)'
      }}
        shadows onCreated={({ gl }) => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; }}
        camera={{ position: camerCood1, fov: 80, near: 1, far: 10000, aspect: window.innerWidth / window.innerHeight }}
      >
        {/* <PerspectiveCamera
          rotation={[0, 0, 0]}
          position={[0, 900, 900]}
          args={[80, window.innerWidth / window.innerHeight, 0.1, 10000]}
        /> */}
        {/* <fog attach="fog" args={['#efefef', 1, 2000]} /> */}

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[50, 50, 50]}
          intensity={1}
          shadow-mapSize={[1024, 1024]}
        >
          <orthographicCamera attach="shadow-camera" args={[-1000, 1000, 1000, -1000]} />
        </directionalLight>

        <Sun sunColor={'#ffff00'} positionX={3 * window.innerWidth} positionY={0.5 * window.innerWidth} />

        <Car direction={direction} />

        <Ground positionY={-RADIUS_Y} radius={RADIUS} />
        <Environment zAxis={1200} />
        <Environment zAxis={680} />
        <Environment zAxis={280} />
        {/* <Environment zAxis={160} /> */}
        <Environment zAxis={-200} />
        <Environment zAxis={-300} />

        <Sky yAxis={-RADIUS_Y} zAxis={0} cloudSize={30} />
        <Sky yAxis={-RADIUS_Y + 300} zAxis={-1200} cloudSize={60} />

        <BackgroundText textIndex={textIndex} textPosition={[0, 300, -300]} textRotation={[0, 0, 0]} />
        {/* <BackgroundPages textIndex={textIndex} pagePosition={[0, 300, -310]} pageRotation={[0, 0, 0]} /> */}

        {/* <ForegroundText textIndex={textIndex} textPosition={[-200, 300, 50]} textRotation={[0, Math.PI / 2, 0]} />
        <ForegroundPages textIndex={textIndex} pagePosition={[-210, 300, 50]} pageRotation={[0, Math.PI / 2, 0]} /> */}

        {/* <OrbitControls enableZoom enablePen enableRotate />
        <Perf /> */}

      </Canvas >
      <div style={{ position: "absolute", bottom: "20px", width: "100%", textAlign: "center" }}>
        <button onClick={moveLeft} onMouseUp={decelerateFromLeft}>Left</button>
        <button onClick={() => setTextIndex(0)}>Start Over ⏎</button>
        <button onClick={moveRight} onMouseUp={decelerateFromRight}>Right</button>
      </div>
    </>
  );
};

export default App;