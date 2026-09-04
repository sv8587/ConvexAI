import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  Eye, 
  Boxes, 
  Sparkles
} from 'lucide-react';
import type { SpliceJoint, DamageMarker, ConveyorTelemetry } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface BeltTwin3DVisualizerProps {
  splices: SpliceJoint[];
  anomalies: DamageMarker[];
  telemetry: ConveyorTelemetry;
  selectedSplice: SpliceJoint | null;
  onSelectSplice: (splice: SpliceJoint) => void;
  onSelectAnomaly: (anomaly: DamageMarker) => void;
}

export const BeltTwin3DVisualizer: React.FC<BeltTwin3DVisualizerProps> = ({
  splices,
  anomalies,
  telemetry,
  selectedSplice,
  onSelectSplice,
  onSelectAnomaly,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredObject, setHoveredObject] = useState<{ title: string; type: string; status: string } | null>(null);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'OVERVIEW' | 'HEAD' | 'CHUTE' | 'SPLICE4' | 'TAIL'>('OVERVIEW');
  const [showOreParticles, setShowOreParticles] = useState<boolean>(true);

  // References to Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetCamLookAt = useRef<THREE.Vector3 | null>(null);
  const beltTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const clickableObjects = useRef<THREE.Object3D[]>([]);
  const particleGroupRef = useRef<THREE.InstancedMesh | null>(null);
  const oreParticleData = useRef<{ x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number }[]>([]);

  const totalLength = telemetry.totalBeltLengthMeters; // 4800m
  const trackLength3D = 70; // 3D units spanning X from -35 to +35

  // Convert 0m - 4800m location to 3D track coordinate
  const meterTo3D = useCallback((meter: number): { x: number; y: number; z: number } => {
    // 0 - 2400m is top carry strand (moving from +35 tail to -35 head)
    // 2400 - 4800m is bottom return strand (moving from -35 head to +35 tail)
    const norm = (meter % totalLength) / totalLength;
    if (norm <= 0.5) {
      // Top strand
      const fraction = norm / 0.5; // 0 to 1
      const x = 35 - fraction * 70; // from +35 to -35
      return { x, y: 3.2, z: 0 };
    } else {
      // Bottom return strand
      const fraction = (norm - 0.5) / 0.5; // 0 to 1
      const x = -35 + fraction * 70; // from -35 to +35
      return { x, y: 1.0, z: 0 };
    }
  }, [totalLength]);

  // Set camera preset smoothly
  const setCameraPreset = (preset: 'OVERVIEW' | 'HEAD' | 'CHUTE' | 'SPLICE4' | 'TAIL') => {
    setActiveCameraPreset(preset);
    audioService.playClick(1050, 0.03);

    if (preset === 'OVERVIEW') {
      targetCamPos.current = new THREE.Vector3(0, 24, 48);
      targetCamLookAt.current = new THREE.Vector3(0, 2, 0);
    } else if (preset === 'HEAD') {
      targetCamPos.current = new THREE.Vector3(-35, 12, 18);
      targetCamLookAt.current = new THREE.Vector3(-35, 3, 0);
    } else if (preset === 'CHUTE') {
      const p = meterTo3D(1450);
      targetCamPos.current = new THREE.Vector3(p.x, 10, 16);
      targetCamLookAt.current = new THREE.Vector3(p.x, 3, 0);
    } else if (preset === 'SPLICE4') {
      const p = meterTo3D(2180);
      targetCamPos.current = new THREE.Vector3(p.x, 8, 14);
      targetCamLookAt.current = new THREE.Vector3(p.x, 3, 0);
    } else if (preset === 'TAIL') {
      targetCamPos.current = new THREE.Vector3(35, 12, 18);
      targetCamLookAt.current = new THREE.Vector3(35, 3, 0);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060a14);
    scene.fog = new THREE.FogExp2(0x060a14, 0.008);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 500);
    camera.position.set(0, 24, 48);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below floor
    controls.minDistance = 6;
    controls.maxDistance = 120;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x3b82f6, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(20, 40, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const blueRimLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    blueRimLight.position.set(-30, 20, -25);
    scene.add(blueRimLight);

    const redWarningLight = new THREE.PointLight(0xef4444, 2.0, 25);
    redWarningLight.position.set(-28, 6, 2);
    scene.add(redWarningLight);

    // 6. Floor Grid
    const gridHelper = new THREE.GridHelper(140, 70, 0x1e293b, 0x0f172a);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 7. Structural Frame (Conveyor Gallery Truss)
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });

    const legGeo = new THREE.BoxGeometry(0.3, 3, 0.3);
    const crossGeo = new THREE.BoxGeometry(trackLength3D, 0.25, 0.25);
    const crossBar1 = new THREE.Mesh(crossGeo, trussMat);
    crossBar1.position.set(0, 2.9, 1.4);
    scene.add(crossBar1);
    const crossBar2 = new THREE.Mesh(crossGeo, trussMat);
    crossBar2.position.set(0, 2.9, -1.4);
    scene.add(crossBar2);
    const crossBarBottom = new THREE.Mesh(crossGeo, trussMat);
    crossBarBottom.position.set(0, 0.7, 0);
    scene.add(crossBarBottom);

    // Supporting uprights every 5 units
    for (let x = -35; x <= 35; x += 5) {
      const leg1 = new THREE.Mesh(legGeo, trussMat);
      leg1.position.set(x, 1.5, 1.4);
      leg1.castShadow = true;
      scene.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, trussMat);
      leg2.position.set(x, 1.5, -1.4);
      leg2.castShadow = true;
      scene.add(leg2);

      // Troughing Idlers (3-roller sets) on top strand
      const idlerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
      const idlerCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 12), idlerMat);
      idlerCenter.rotation.x = Math.PI / 2;
      idlerCenter.position.set(x, 2.9, 0);
      scene.add(idlerCenter);

      const idlerWing1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 12), idlerMat);
      idlerWing1.rotation.z = 0.25;
      idlerWing1.rotation.x = Math.PI / 2;
      idlerWing1.position.set(x, 3.1, 0.9);
      scene.add(idlerWing1);

      const idlerWing2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 12), idlerMat);
      idlerWing2.rotation.z = -0.25;
      idlerWing2.rotation.x = Math.PI / 2;
      idlerWing2.position.set(x, 3.1, -0.9);
      scene.add(idlerWing2);

      // Return idler roller on bottom strand
      const returnIdler = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.4, 12), idlerMat);
      returnIdler.rotation.x = Math.PI / 2;
      returnIdler.position.set(x, 1.15, 0);
      scene.add(returnIdler);
    }

    // 8. Head Drive Pulley (-35) & Tail Take-up Pulley (+35)
    const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
    const pulleyGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.6, 24);

    const headPulley = new THREE.Mesh(pulleyGeo, pulleyMat);
    headPulley.rotation.x = Math.PI / 2;
    headPulley.position.set(-35, 2.1, 0);
    headPulley.castShadow = true;
    scene.add(headPulley);

    const tailPulley = new THREE.Mesh(pulleyGeo, pulleyMat);
    tailPulley.rotation.x = Math.PI / 2;
    tailPulley.position.set(35, 2.1, 0);
    tailPulley.castShadow = true;
    scene.add(tailPulley);

    // Head Chute Hopper (discharging iron ore)
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.5 });
    const chuteGeo = new THREE.BoxGeometry(4, 5, 3.2);
    const chuteHopper = new THREE.Mesh(chuteGeo, chuteMat);
    chuteHopper.position.set(-35, 6.2, 0);
    scene.add(chuteHopper);

    // Primary Feeder Loading Chute (at chainage ~1,450m)
    const loadChuteGeo = new THREE.BoxGeometry(3, 4, 2.8);
    const loadChute = new THREE.Mesh(loadChuteGeo, chuteMat);
    const loadChuteX = meterTo3D(1450).x;
    loadChute.position.set(loadChuteX, 5.8, 0);
    scene.add(loadChute);

    // 9. Conveyor Belt Dynamic Looped Texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark rubber conveyor with chevron rib pattern
      ctx.fillStyle = '#182030';
      ctx.fillRect(0, 0, 1024, 128);

      // Cleat grooves
      ctx.strokeStyle = '#27354a';
      ctx.lineWidth = 3;
      for (let i = 0; i < 1024; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 16, 64);
        ctx.lineTo(i, 128);
        ctx.stroke();
      }

      // Edge warning line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 2, 1024, 124);
    }
    const beltTexture = new THREE.CanvasTexture(canvas);
    beltTexture.wrapS = THREE.RepeatWrapping;
    beltTexture.wrapT = THREE.RepeatWrapping;
    beltTexture.repeat.set(12, 1);
    beltTextureRef.current = beltTexture;

    const beltMat = new THREE.MeshStandardMaterial({
      map: beltTexture,
      roughness: 0.8,
      metalness: 0.1,
      bumpScale: 0.05,
    });

    // Top Strand Belt (Carry)
    const topBeltGeo = new THREE.BoxGeometry(trackLength3D, 0.08, 2.2);
    const topBelt = new THREE.Mesh(topBeltGeo, beltMat);
    topBelt.position.set(0, 3.2, 0);
    topBelt.castShadow = true;
    scene.add(topBelt);

    // Bottom Strand Belt (Return)
    const bottomBeltGeo = new THREE.BoxGeometry(trackLength3D, 0.08, 2.2);
    const bottomBelt = new THREE.Mesh(bottomBeltGeo, beltMat);
    bottomBelt.position.set(0, 1.0, 0);
    scene.add(bottomBelt);

    // 10. Ore Particle System (Iron ore lumps on belt)
    const particleCount = 180;
    const oreGeo = new THREE.DodecahedronGeometry(0.22, 0);
    const oreMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // Iron ore reddish-brown
      roughness: 0.9,
      metalness: 0.1,
    });
    const instancedOre = new THREE.InstancedMesh(oreGeo, oreMat, particleCount);
    instancedOre.castShadow = true;
    scene.add(instancedOre);
    particleGroupRef.current = instancedOre;

    const dummy = new THREE.Object3D();
    oreParticleData.current = [];
    for (let i = 0; i < particleCount; i++) {
      const x = loadChuteX - Math.random() * (loadChuteX - (-35));
      const z = (Math.random() - 0.5) * 1.5;
      const y = 3.32;
      oreParticleData.current.push({
        x,
        y,
        z,
        vx: -0.15,
        vy: 0,
        vz: 0,
        life: Math.random() * 100,
      });
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.7 + Math.random() * 0.8);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      instancedOre.setMatrixAt(i, dummy.matrix);
    }
    instancedOre.instanceMatrix.needsUpdate = true;

    // 11. Splice Markers in 3D
    const spliceMarkers: THREE.Object3D[] = [];
    splices.forEach((splice) => {
      const pos = meterTo3D(splice.locationMeter);
      const isCritical = splice.status === 'CRITICAL';
      const isWarning = splice.status === 'WARNING';
      const color = isCritical ? 0xef4444 : isWarning ? 0xf59e0b : 0x10b981;

      // Splice Beacon Group
      const group = new THREE.Group();
      group.position.set(pos.x, pos.y + 0.6, pos.z);
      group.userData = { type: 'SPLICE', data: splice };

      // Beacon Pin Cylinder
      const pinMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: isCritical ? 1.0 : 0.4,
        metalness: 0.8,
        roughness: 0.2,
      });
      const pinGeo = new THREE.CylinderGeometry(0.35, 0.05, 1.2, 16);
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.y = 0.6;
      group.add(pinMesh);

      // Glowing Base Ring
      const ringGeo = new THREE.RingGeometry(0.5, 0.7, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.05;
      group.add(ringMesh);

      scene.add(group);
      spliceMarkers.push(group);
      clickableObjects.current.push(pinMesh);
    });

    // 12. Damage Anomaly Pins in 3D
    anomalies.forEach((anomaly) => {
      const pos = meterTo3D(anomaly.locationMeter);
      const isCritical = anomaly.severity === 'CRITICAL';
      const color = isCritical ? 0xef4444 : 0xf59e0b;

      const group = new THREE.Group();
      group.position.set(pos.x, pos.y + 0.2, pos.z + 0.5);
      group.userData = { type: 'ANOMALY', data: anomaly };

      // Warning Diamond/Octahedron
      const octGeo = new THREE.OctahedronGeometry(0.4, 0);
      const octMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
      });
      const octMesh = new THREE.Mesh(octGeo, octMat);
      octMesh.position.y = 0.8;
      group.add(octMesh);

      scene.add(group);
      clickableObjects.current.push(octMesh);
    });

    // 13. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects.current, true);

      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const hit = intersects[0].object;
        const parent = hit.parent;
        if (parent && parent.userData.type === 'SPLICE') {
          const sp = parent.userData.data as SpliceJoint;
          setHoveredObject({
            title: sp.label,
            type: `Splice #${sp.id} (${sp.locationMeter}m)`,
            status: `${sp.status} - Pullout: +${sp.cordPullOutMm}mm`,
          });
        } else if (parent && parent.userData.type === 'ANOMALY') {
          const an = parent.userData.data as DamageMarker;
          setHoveredObject({
            title: an.label,
            type: `${an.type} (${an.locationMeter}m)`,
            status: `${an.severity} - Conf: ${(an.confidence * 100).toFixed(1)}%`,
          });
        }
      } else {
        container.style.cursor = 'default';
        setHoveredObject(null);
      }
    };

    const handlePointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects.current, true);

      if (intersects.length > 0) {
        audioService.playClick(1200, 0.05);
        const hit = intersects[0].object;
        const parent = hit.parent;
        if (parent && parent.userData.type === 'SPLICE') {
          onSelectSplice(parent.userData.data);
        } else if (parent && parent.userData.type === 'ANOMALY') {
          onSelectAnomaly(parent.userData.data);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handlePointerClick);

    // 14. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 15. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Conveyor Belt movement texture
      if (beltTextureRef.current && telemetry.isRunning) {
        const speedFactor = (telemetry.speedMps / 4.8) * 0.45;
        beltTextureRef.current.offset.x -= delta * speedFactor;
      }

      // Rotate pulleys
      if (telemetry.isRunning) {
        const rotDelta = delta * (telemetry.speedMps / 4.8) * 4;
        headPulley.rotation.y += rotDelta;
        tailPulley.rotation.y += rotDelta;
      }

      // Smooth camera lerp if preset triggered
      if (targetCamPos.current && targetCamLookAt.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetCamLookAt.current, 0.06);
        if (camera.position.distanceTo(targetCamPos.current) < 0.2) {
          targetCamPos.current = null;
          targetCamLookAt.current = null;
        }
      }

      // Ore particles dynamic movement
      if (instancedOre && telemetry.isRunning && showOreParticles) {
        const oreSpeed = (telemetry.speedMps / 4.8) * 0.22;
        const d = new THREE.Object3D();

        oreParticleData.current.forEach((pt, i) => {
          pt.x -= oreSpeed;
          // Reached discharge head pulley? Drop into hopper and recycle
          if (pt.x <= -35) {
            pt.x = loadChuteX + (Math.random() - 0.5) * 1.5;
            pt.z = (Math.random() - 0.5) * 1.5;
            pt.y = 3.32;
          }

          d.position.set(pt.x, pt.y, pt.z);
          d.scale.setScalar(0.7 + (i % 3) * 0.3);
          d.rotation.set(elapsed + i, elapsed * 0.5 + i, 0);
          d.updateMatrix();
          instancedOre.setMatrixAt(i, d.matrix);
        });
        instancedOre.instanceMatrix.needsUpdate = true;
      }

      // Critical beacon pulse animation
      spliceMarkers.forEach((g) => {
        const sp = g.userData.data as SpliceJoint;
        if (sp.status === 'CRITICAL') {
          const s = 1.0 + Math.sin(elapsed * 6) * 0.25;
          g.scale.set(s, s, s);
          redWarningLight.intensity = 1.5 + Math.sin(elapsed * 6) * 1.5;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handlePointerClick);
      if (rendererRef.current?.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [meterTo3D, onSelectAnomaly, onSelectSplice, splices, anomalies, telemetry.isRunning, telemetry.speedMps, showOreParticles]);

  useEffect(() => {
    if (selectedSplice) {
      const p = meterTo3D(selectedSplice.locationMeter);
      targetCamPos.current = new THREE.Vector3(p.x, 8, 14);
      targetCamLookAt.current = new THREE.Vector3(p.x, 3, 0);
    }
  }, [selectedSplice, meterTo3D]);

  return (
    <div className="relative w-full h-[460px] bg-[#050811] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Floating Overlay Controls */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {/* Left: 3D Twin Status Pill */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#090d16]/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-mono">
            <span>3D WebGL Digital Twin</span>
            <span className="text-[10px] text-slate-400 font-normal">| ST-5400 Loop</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
            {telemetry.isRunning ? `${telemetry.speedMps} m/s` : 'STOPPED'}
          </span>
        </div>

        {/* Right: Camera Presets & Layer Toggles */}
        <div className="pointer-events-auto flex items-center flex-wrap gap-1.5 bg-[#090d16]/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-lg text-xs shadow-lg">
          <span className="text-[11px] text-slate-400 font-semibold px-2 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Cam:</span>
          </span>

          <button
            onClick={() => setCameraPreset('OVERVIEW')}
            className={`px-2 py-1 rounded transition-colors font-medium ${
              activeCameraPreset === 'OVERVIEW' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCameraPreset('HEAD')}
            className={`px-2 py-1 rounded transition-colors font-medium ${
              activeCameraPreset === 'HEAD' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Drive Head
          </button>
          <button
            onClick={() => setCameraPreset('CHUTE')}
            className={`px-2 py-1 rounded transition-colors font-medium ${
              activeCameraPreset === 'CHUTE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chute Impact
          </button>
          <button
            onClick={() => setCameraPreset('SPLICE4')}
            className={`px-2 py-1 rounded transition-colors font-medium ${
              activeCameraPreset === 'SPLICE4' ? 'bg-red-900/60 border border-red-500 text-red-300 shadow-sm' : 'text-slate-400 hover:text-red-400'
            }`}
          >
            Splice #4 ⚠
          </button>
          <button
            onClick={() => setCameraPreset('TAIL')}
            className={`px-2 py-1 rounded transition-colors font-medium ${
              activeCameraPreset === 'TAIL' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tail Pulley
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* Ore Particles Toggle */}
          <button
            onClick={() => setShowOreParticles(!showOreParticles)}
            className={`p-1.5 rounded transition-colors ${
              showOreParticles ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={showOreParticles ? 'Hide Ore Particle Flow' : 'Show Ore Particle Flow'}
          >
            <Boxes className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Interactive Hover Details */}
      {hoveredObject && (
        <div className="absolute bottom-4 left-4 pointer-events-none z-10 animate-fade-in">
          <div className="bg-[#090d16]/95 backdrop-blur-md border border-slate-600 px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-slate-800 text-sky-400 border border-slate-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">{hoveredObject.title}</div>
              <div className="text-[11px] text-slate-300">{hoveredObject.type} &bull; <span className="font-semibold text-sky-400">{hoveredObject.status}</span></div>
            </div>
            <span className="text-[10px] text-slate-400 italic">Click to inspect</span>
          </div>
        </div>
      )}

      {/* Bottom Right Orbit Controls Legend */}
      <div className="absolute bottom-3 right-3 pointer-events-none z-10 text-[10px] text-slate-400 bg-black/60 backdrop-blur px-2.5 py-1 rounded border border-slate-800 flex items-center gap-2 font-mono">
        <span>🖱 Drag: Rotate</span>
        <span>&bull;</span>
        <span>Scroll: Zoom</span>
        <span>&bull;</span>
        <span>Right-Click: Pan</span>
      </div>
    </div>
  );
};
