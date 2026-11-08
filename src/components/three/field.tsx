/* eslint-disable react-hooks/immutability --
   Une boucle de rendu WebGL avance en mutant : on écrit dans les uniformes et
   dans les tableaux de particules soixante fois par seconde, et allouer à
   neuf à chaque image produirait exactement le ramage qu'on cherche à
   éviter. La règle protège d'un vrai piège React ; ici le modèle impératif
   est celui que react-three-fiber documente, et rien de ce qui est muté
   n'alimente un rendu React. */
"use client";
// Le compilateur React mémoïse et interdit la mutation : or une scène WebGL
// n'avance QUE par mutation d'uniformes, image après image. Ce fichier est
// impératif par nature, et le compilateur n'a rien à y optimiser.
"use no memo";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Le champ.
 *
 * Une grille de points dont le relief est calculé par un bruit simplex
 * — dans le VERTEX SHADER, donc sur le GPU. Le processeur ne touche à
 * rien d'une image à l'autre : il ne pousse que deux nombres (le temps,
 * la position du curseur). C'est la raison pour laquelle cette scène ne
 * peut pas reproduire le défilement saccadé d'avant.
 *
 * Toute la grille est un seul `<points>`, donc un seul appel de dessin
 * pour 8 400 points.
 */

const COLS = 120;
const ROWS = 70;
const SPREAD_X = 26;
const SPREAD_Y = 15;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uLift;
  attribute float aScale;
  varying float vElev;

  // Bruit simplex 2D — Ashima Arts, domaine public.
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec3 pos = position;

    // Deux octaves : une houle lente, et un grain plus fin par-dessus.
    float swell = snoise(pos.xy * 0.16 + vec2(uTime * 0.055, uTime * 0.035));
    float grain = snoise(pos.xy * 0.46 - vec2(uTime * 0.03, uTime * 0.02));
    float elev = swell * 1.05 + grain * 0.32;

    // La bosse qui suit le curseur. Une gaussienne, pas un rayon net :
    // le relief doit se soulever, pas se découper.
    float d = distance(pos.xy, uPointer);
    elev += exp(-d * d * 0.055) * 2.4 * uLift;

    pos.z += elev;
    vElev = elev;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // La taille décroît avec la distance : c'est ce qui donne la profondeur.
    gl_PointSize = (26.0 * aScale) / max(-mv.z, 0.001);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uLow;
  uniform vec3 uHigh;
  uniform float uOpacity;
  varying float vElev;

  void main() {
    // Un point carré se voit ; on le rend rond et on adoucit le bord.
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.12, d);

    float t = smoothstep(-0.9, 1.9, vElev);
    vec3 c = mix(uLow, uHigh, t);

    gl_FragColor = vec4(c, edge * (0.12 + t * 0.88) * uOpacity);
  }
`;

export function Field({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points>(null!);
  const { size } = useThree();

  // Cible et valeur courante du curseur, en unités du monde.
  const target = useRef(new THREE.Vector2(0, -40));
  const current = useRef(new THREE.Vector2(0, -40));
  const lift = useRef(0);

  const { positions, scales } = useMemo(() => {
    // Générateur congruentiel : stable, sans dépendance, et surtout pur.
    let seed = 0x9e3779b9;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };

    const positions = new Float32Array(COLS * ROWS * 3);
    const scales = new Float32Array(COLS * ROWS);
    let i = 0;
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        // Un léger désordre : une grille parfaite se lit comme un damier.
        // Le tirage est déterministe — même champ à chaque rendu, et rien
        // d'impur pendant le rendu React.
        const jx = (rand() - 0.5) * 0.35;
        const jy = (rand() - 0.5) * 0.35;
        positions[i * 3] = (x / (COLS - 1) - 0.5) * SPREAD_X + jx;
        positions[i * 3 + 1] = (y / (ROWS - 1) - 0.5) * SPREAD_Y + jy;
        positions[i * 3 + 2] = 0;
        scales[i] = 0.55 + rand() * 0.75;
        i++;
      }
    }
    return { positions, scales };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, -40) },
      uLift: { value: 0 },
      uOpacity: { value: 0 },
      uLow: { value: new THREE.Color("#1d3350") },
      uHigh: { value: new THREE.Color("#d9c29a") },
    }),
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      // Écran → monde, en gardant les proportions du champ.
      target.current.set(
        (e.clientX / size.width - 0.5) * SPREAD_X,
        -(e.clientY / size.height - 0.5) * SPREAD_Y,
      );
      lift.current = 1;
    };
    const onLeave = () => {
      lift.current = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [size.width, size.height]);

  useFrame((state, delta) => {
    const u = uniforms;
    // Apparition : la scène monte en opacité au lieu de surgir.
    u.uOpacity.value = Math.min(1, u.uOpacity.value + delta * 0.9);

    if (reduced) {
      // Mouvement réduit : le relief existe, il ne bouge pas.
      u.uTime.value = 12;
      u.uLift.value = 0;
      return;
    }

    u.uTime.value = state.clock.elapsedTime;
    current.current.lerp(target.current, 1 - Math.pow(0.004, delta));
    u.uPointer.value.copy(current.current);
    u.uLift.value += (lift.current - u.uLift.value) * Math.min(1, delta * 2.4);
  });

  return (
    <points ref={points} rotation={[-0.42, 0, 0]} position={[0, -1.1, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
