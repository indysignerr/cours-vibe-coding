"use client";

import { PerformanceMonitor, Preload } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Color,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector3,
  type Group,
  type InstancedMesh,
} from "three";
import { C, build, clamp01, smooth, span, split } from "@/components/lab/kit";
import { BASE, ROOMS, type Burst, type Room } from "@/components/lab/rooms";

/**
 * La maquette du labo : un plateau tournant, quatre pièces, une lampe.
 *
 * La scène est en React-Three-Fiber. Elle ne télécharge aucun modèle : le
 * décor est construit en code (voir kit.ts et rooms.ts) et fondu en une
 * poignée d'objets. Le défilement de la page lui arrive par `progress`,
 * un nombre de 0 à 3 : il fait tourner le plateau, et la pièce qui vient
 * devant s'anime pendant que les trois autres dorment.
 *
 * Fluidité : toute l'animation passe par `useFrame` ; les lumières ne
 * changent jamais de nombre (pas de recompilation en cours de route) ;
 * la boucle s'arrête quand la maquette sort de l'écran (`running`) ; et
 * si l'appareil peine, seule la résolution baisse, jamais le contenu.
 */
type Props = {
  progress: RefObject<number>;
  /** La maquette est-elle à l'écran ? Sinon la boucle s'arrête. */
  running: boolean;
  /** Grand écran à souris : ombres plus fines, léger suivi du curseur. */
  fine: boolean;
  onReady: () => void;
};

const QUARTER = Math.PI / 2;
/** L'angle qui met la première pièce face à la caméra. */
const FRONT = -Math.PI / 4;

/** Pour refaire les images fixes (voir le README) : la scène, figée à la demande. */
type LabDebug = {
  hold: boolean;
  times: { current: number }[];
  progress?: RefObject<number>;
  snap?: () => Promise<Blob | null>;
};
export const labDebug: LabDebug = { hold: false, times: [] };

export default function LabCanvas({ progress, running, fine, onReady }: Props) {
  const [dpr, setDpr] = useState<number | [number, number]>(fine ? [1, 1.75] : [1, 1.5]);

  return (
    <Canvas
      shadows
      dpr={dpr}
      frameloop={running ? "always" : "never"}
      camera={{ fov: 30, near: 1, far: 90, position: [0, 10, 16] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      {/* L'appareil peine : on baisse la résolution, rien d'autre. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Lab progress={progress} fine={fine} onReady={onReady} />
      <Preload all />
    </Canvas>
  );
}

function Lab({ progress, fine, onReady }: Omit<Props, "running">) {
  const table = useRef<Group>(null);
  const motion = useRef({ turn: 0, sway: 0, ready: false });
  const powers = useRef<number[]>(ROOMS.map((_, i) => (i === 0 ? 1 : 0)));
  const { camera, size, gl, scene } = useThree();

  // Un matériau mat pour tout ce qui est éclairé, un par pièce pour ce qui éclaire.
  const matte = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 }),
    [],
  );
  const glows = useMemo(
    () => ROOMS.map(() => new MeshBasicMaterial({ vertexColors: true, toneMapped: false })),
    [],
  );
  const base = useMemo(() => build(BASE), []);
  useEffect(
    () => () => {
      matte.dispose();
      glows.forEach((g) => g.dispose());
      base?.dispose();
    },
    [matte, glows, base],
  );

  // Le cadrage : la maquette tient dans le cadre, qu'il soit large ou haut.
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const distance = 20.5 * Math.max(1, 1.3 / aspect);
    const tilt = 0.54;
    camera.position.set(0, 1.2 + distance * Math.sin(tilt), distance * Math.cos(tilt));
    camera.lookAt(0, 1.25, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    labDebug.progress = progress;
    labDebug.snap = () => {
      gl.render(scene, camera);
      return new Promise((resolve) => gl.domElement.toBlob(resolve, "image/png"));
    };
    (window as unknown as { __lab?: LabDebug }).__lab = labDebug;
  }, [gl, scene, camera, progress]);

  useFrame((state, dt) => {
    const last = ROOMS.length - 1;
    const p = Math.min(last, Math.max(0, progress.current ?? 0));
    const whole = Math.floor(p);
    // Le plateau s'attarde sur chaque pièce et tourne entre deux.
    const target = Math.min(last, whole + smooth(span(p - whole, 0.2, 0.8)));
    const m = motion.current;
    const ease = labDebug.hold ? 1 : 1 - Math.exp(-dt * 5);
    m.turn += (target - m.turn) * ease;
    m.sway += ((fine ? state.pointer.x * 0.09 : 0) - m.sway) * (1 - Math.exp(-dt * 3));
    if (table.current) table.current.rotation.y = FRONT - m.turn * QUARTER + m.sway;

    powers.current.forEach((power, i) => {
      const next = power + ((Math.abs(m.turn - i) < 0.5 ? 1 : 0) - power) * (labDebug.hold ? 1 : 1 - Math.exp(-dt * 4));
      powers.current[i] = next;
      glows[i].color.setScalar(0.3 + 0.7 * next);
    });

    if (!m.ready) {
      m.ready = true;
      onReady();
    }
  });

  return (
    <>
      <hemisphereLight args={["#7389ab", "#0e1a2b", 1.05]} />
      <spotLight
        position={[3.5, 11, 10]}
        angle={0.52}
        penumbra={1}
        intensity={1150}
        color="#ffe9cc"
        castShadow
        shadow-mapSize={fine ? [2048, 2048] : [1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.035}
      />
      <directionalLight position={[-7, 6, -9]} intensity={0.55} color="#a9c1ea" />
      <Bulb />
      <group ref={table} rotation={[0, FRONT, 0]}>
        {base ? <mesh geometry={base} material={matte} castShadow receiveShadow /> : null}
        {ROOMS.map((room, i) => (
          <RoomView key={room.key} room={room} index={i} matte={matte} glow={glows[i]} powers={powers} />
        ))}
      </group>
    </>
  );
}

/**
 * La lampe du labo : le logo, en volume. Un anneau pour le verre, le « L »
 * pour filament, les cinq rayons. Elle ne tourne pas avec le plateau : elle
 * fait face à la caméra, et c'est elle qui éclaire les quatre pièces.
 */
function Bulb() {
  const rays = useRef<Group>(null);
  useFrame(({ clock }) => {
    rays.current?.scale.setScalar(0.94 + 0.06 * Math.sin(clock.elapsedTime * 1.4));
  });

  return (
    <group position={[0, 3.22, 0]}>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.21, 0.25, 0.32, 20]} />
        <meshStandardMaterial color={C.navy3} roughness={0.6} />
      </mesh>
      <pointLight position={[0, 0.9, 0]} color="#ffcf96" intensity={52} distance={18} decay={2} />
      {/* Le dessin du logo, incliné vers la caméra. */}
      <group position={[0, 0.9, 0]} rotation={[-0.5, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.56, 28, 20]} />
          <meshBasicMaterial color="#ffc978" transparent opacity={0.13} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.58, 0.04, 10, 48]} />
          <meshBasicMaterial color={C.paper} toneMapped={false} />
        </mesh>
        <mesh position={[-0.11, 0.03, 0]}>
          <capsuleGeometry args={[0.052, 0.4, 4, 10]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
        <mesh position={[0.04, -0.17, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.052, 0.3, 4, 10]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
        <group ref={rays}>
          {[-60, -30, 0, 30, 60].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return (
              <mesh key={deg} position={[1.04 * Math.sin(a), 1.04 * Math.cos(a), 0]} rotation={[0, 0, -a]}>
                <capsuleGeometry args={[0.055, 0.32, 4, 10]} />
                <meshBasicMaterial color={C.beigeSoft} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}

function RoomView({
  room,
  index,
  matte,
  glow,
  powers,
}: {
  room: Room;
  index: number;
  matte: MeshStandardMaterial;
  glow: MeshBasicMaterial;
  powers: RefObject<number[]>;
}) {
  const decor = useMemo(() => split(room.pieces), [room]);
  const parts = useMemo(() => room.movers.map((m) => split(m.pieces)), [room]);
  const refs = useRef<(Group | null)[]>([]);
  const time = useRef(room.rest);
  const posed = useRef(false);

  useEffect(() => {
    labDebug.times[index] = time;
    return () => {
      decor.solid?.dispose();
      decor.glow?.dispose();
      parts.forEach((p) => {
        p.solid?.dispose();
        p.glow?.dispose();
      });
    };
  }, [decor, parts, index]);

  useFrame((_, dt) => {
    const awake = (powers.current?.[index] ?? 0) > 0.5;
    if (awake && !labDebug.hold) time.current = (time.current + Math.min(dt, 0.1)) % room.period;
    // Une pièce qui dort garde la pose : on ne la recalcule pas.
    if (!awake && posed.current && !labDebug.hold) return;
    posed.current = true;
    room.movers.forEach((m, i) => {
      const o = refs.current[i];
      if (o) m.move(o, time.current);
    });
  });

  return (
    <group rotation={[0, index * QUARTER, 0]}>
      {decor.solid ? <mesh geometry={decor.solid} material={matte} castShadow receiveShadow /> : null}
      {decor.glow ? <mesh geometry={decor.glow} material={glow} /> : null}
      {room.movers.map((m, i) => (
        <group key={i} position={m.at} rotation={[0, m.rot ?? 0, 0]}>
          <group
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            {parts[i].solid ? <mesh geometry={parts[i].solid!} material={matte} castShadow /> : null}
            {parts[i].glow ? <mesh geometry={parts[i].glow!} material={glow} /> : null}
          </group>
        </group>
      ))}
      {room.burst ? <Confetti burst={room.burst} time={time} powers={powers} index={index} /> : null}
    </group>
  );
}

/** Les confettis de l'équipe qui gagne : une seule géométrie, dessinée N fois. */
function Confetti({
  burst,
  time,
  powers,
  index,
}: {
  burst: Burst;
  time: RefObject<number>;
  powers: RefObject<number[]>;
  index: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: burst.count }, (_, i) => {
        // Un tirage stable d'un rendu à l'autre : pas de Math.random au rendu.
        const r = (n: number) => {
          const x = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
          return x - Math.floor(x);
        };
        const a = r(1) * Math.PI * 2;
        const speed = 0.5 + r(2) * 1.0;
        return { vx: Math.cos(a) * speed, vz: Math.sin(a) * speed, vy: 2.2 + r(3) * 2.4, spin: 3 + r(4) * 7, tilt: r(5) * 3 };
      }),
    [burst.count],
  );
  const tools = useMemo(
    () => ({ m: new Matrix4(), q: new Quaternion(), axis: new Vector3(1, 0.4, 0.2).normalize(), p: new Vector3(), s: new Vector3(), o: new Object3D() }),
    [],
  );

  useEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    const colors = [C.beige, C.paper, C.warm, C.beigeSoft];
    const color = new Color();
    seeds.forEach((_, i) => inst.setColorAt(i, color.set(colors[i % colors.length])));
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [seeds]);

  useFrame(() => {
    const inst = mesh.current;
    if (!inst) return;
    const tau = (time.current ?? 0) - burst.t0;
    // Une pièce qui dort ne garde pas ses confettis en l'air.
    const shown = tau > 0 && tau < 2.3 && (powers.current?.[index] ?? 0) > 0.5;
    seeds.forEach((sd, i) => {
      const k = shown ? clamp01(1 - (tau - 1.7) / 0.6) : 0;
      tools.p.set(burst.at[0] + sd.vx * tau, Math.max(0.1, burst.at[1] + sd.vy * tau - 2.6 * tau * tau), burst.at[2] + sd.vz * tau);
      tools.q.setFromAxisAngle(tools.axis, sd.tilt + sd.spin * tau);
      tools.s.setScalar(Math.max(0.0001, k));
      inst.setMatrixAt(i, tools.m.compose(tools.p, tools.q, tools.s));
    });
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, burst.count]} frustumCulled={false}>
      <boxGeometry args={[0.09, 0.02, 0.09]} />
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
}
