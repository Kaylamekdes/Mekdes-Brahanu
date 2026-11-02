/* eslint-disable */
// Originkit — props baked into the default export.
"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import * as THREE from "three";

// Floor/ceiling slabs are 1:2 and wall slabs 20:9 at grid 4, so each slab
// type has its own list, made at that ratio. The lists can differ in length.
const DEFAULT_FLOOR_IMAGES: ImageBoxImage[] = ["src", "nil", "sav", "dc", "ali"].map(
    (name) => ({ src: `/work/${name}-floor.webp` })
);
const DEFAULT_WALL_IMAGES: ImageBoxImage[] = ["src", "nil", "sav", "dc", "ali", "cry"].map(
    (name) => ({ src: `/work/${name}-wall.webp` })
);

// Colour of every slab that isn't showing an image. Kept just above the
// #0a0a0a page so the tunnel's shape reads without turning grey.
const EMPTY_SLAB_COLOR = "#121115";
const LINE_COLOR = "#B0B0B0";

const DEFAULTS = {
    background: "#000000",
    lineColor: LINE_COLOR,
    lineOpacity: 50,
    colors: [EMPTY_SLAB_COLOR],
    grid: 4,
    speed: 100,
    boost: 100,
    fade: 100,
};

const TUNNEL_WIDTH = 2;
const TUNNEL_HEIGHT = 1.8;
const SEGMENT_DEPTH = 1;
const NUM_SEGMENTS = 15;
const LINE_RADIUS = 0.003;
const SCROLL_TO_Z = 0.05;
const CAMERA_CHASE = 0.1;
const FADE_IN = 1;
// Share of the gap to the target speed closed each frame, so speed changes ease.
const SPEED_EASE = 0.06;

const FOG_FAR = NUM_SEGMENTS * SEGMENT_DEPTH * 0.95;

interface ImageBoxImage {
    src: string;
    alt?: string;
}

interface ImageBoxProps {
    // Floor and ceiling slabs.
    images: ImageBoxImage[];
    // Left and right wall slabs.
    wallImages: ImageBoxImage[];
    colors: string[];
    background: string;
    lineColor: string;
    lineOpacity: number;
    grid: number;
    speed: number;
    boost: number;
    fade: number;
    style?: CSSProperties;
    // Live overrides read every frame, so scroll can steer the tunnel
    // without re-rendering.
    motion?: { current: TunnelMotion };
}

export interface TunnelMotion {
    // Extra forward distance (world units) added to the camera target.
    drift: number;
    // Base speed in the same units as the `speed` prop (100 = original).
    speed: number;
    // Whether click-and-hold boost is allowed.
    boost: boolean;
    // Skip drawing while the tunnel is off screen.
    paused?: boolean;
}

const srcOf = (image: any): string =>
    typeof image === "string" ? image : (image?.src ?? "");

const urlsOf = (images: unknown[] | undefined, fallback: ImageBoxImage[]) => {
    const list = (images ?? []).map(srcOf).filter(Boolean);
    return list.length ? list : fallback.map(srcOf);
};

function __OriginkitBase_ImageBox(props: Partial<ImageBoxProps>) {
    const {
        images,
        wallImages,
        colors,
        background = DEFAULTS.background,
        lineColor = DEFAULTS.lineColor,
        lineOpacity = DEFAULTS.lineOpacity,
        grid = DEFAULTS.grid,
        speed = DEFAULTS.speed,
        boost = DEFAULTS.boost,
        fade = DEFAULTS.fade,
        style,
        motion,
    } = props;

    const motionRef = useRef(motion);
    motionRef.current = motion;

    const frameRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const floorUrls = useMemo(
        () => urlsOf(images, DEFAULT_FLOOR_IMAGES),
        [images]
    );
    const wallUrls = useMemo(
        () => urlsOf(wallImages, DEFAULT_WALL_IMAGES),
        [wallImages]
    );

    const palette = useMemo(() => {
        const list = (colors ?? []).filter(Boolean);
        return list.length ? list : DEFAULTS.colors;
    }, [colors]);

    const cfgRef = useRef<{ speed: number; boost: number }>({ speed: 1, boost: 1 });
    cfgRef.current = {
        speed: Math.max(0, speed) / 100,
        boost: Math.max(0, boost) / 10,
    };

    useEffect(() => {
        const frame = frameRef.current;
        const canvas = canvasRef.current;
        if (!frame || !canvas) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(background);

        const fogNear = Math.min(
            FOG_FAR * (1 - Math.min(100, Math.max(0, fade)) / 100),
            FOG_FAR - 0.01
        );
        scene.fog = new THREE.Fog(new THREE.Color(background), fogNear, FOG_FAR);

        const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
        camera.position.set(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const lineMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(lineColor),
            transparent: true,
            opacity: Math.min(100, Math.max(0, lineOpacity)) / 100,
        });

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        const fading: THREE.MeshBasicMaterial[] = [];

        // One counter per slab type, stepping by 1 so every image in a list
        // comes up whatever its length.
        let floorIndex = 0;
        let wallIndex = 0;
        let colorIndex = 0;
        let populateIndex = 0;
        let scrollPos = 0;
        let speedNow = cfgRef.current.speed;
        let raf = 0;
        let last = 0;
        let pressed = false;
        let alive = true;

        const hw = TUNNEL_WIDTH / 2;
        const hh = TUNNEL_HEIGHT / 2;

        const cols = Math.max(1, Math.round(grid));
        const rows = Math.max(1, Math.round(grid));
        const colW = TUNNEL_WIDTH / cols;
        const rowH = TUNNEL_HEIGHT / rows;

        const geoFloor = new THREE.PlaneGeometry(colW, SEGMENT_DEPTH);
        const geoWall = new THREE.PlaneGeometry(SEGMENT_DEPTH, rowH);

        const geoTubeZ = new THREE.TubeGeometry(
            new THREE.LineCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -SEGMENT_DEPTH)
            ),
            1,
            LINE_RADIUS,
            8
        );
        const geoTubeX = new THREE.TubeGeometry(
            new THREE.LineCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(TUNNEL_WIDTH, 0, 0)
            ),
            1,
            LINE_RADIUS,
            8
        );
        const geoTubeY = new THREE.TubeGeometry(
            new THREE.LineCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, TUNNEL_HEIGHT, 0)
            ),
            1,
            LINE_RADIUS,
            8
        );

        const colorMats = palette.map(
            (hex) =>
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color(hex),
                    side: THREE.DoubleSide,
                })
        );

        const loadImageMat = (url: string) => {
            const mat = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
            });
            loader.load(
                url,
                (tex) => {
                    if (!alive) {
                        tex.dispose();
                        return;
                    }
                    tex.minFilter = THREE.LinearFilter;
                    tex.generateMipmaps = false;
                    tex.colorSpace = THREE.SRGBColorSpace;
                    mat.map = tex;
                    mat.needsUpdate = true;
                    fading.push(mat);
                },
                undefined,
                () => {
                    // A dead URL should cost a blank slab, not a broken tunnel.
                }
            );
            return mat;
        };
        const floorMats = floorUrls.map(loadImageMat);
        const wallMats = wallUrls.map(loadImageMat);

        const tube = (
            geo: THREE.BufferGeometry,
            x: number,
            y: number,
            z = 0
        ) => {
            const m = new THREE.Mesh(geo, lineMaterial);
            m.position.set(x, y, z);
            return m;
        };

        const SLOTS: Array<{
            geo: THREE.BufferGeometry;
            pos: THREE.Vector3;
            rot: THREE.Euler;
        }> = [];
        {
            const z = -SEGMENT_DEPTH / 2;
            for (let i = 0; i < cols; i++) {
                const x = -hw + i * colW + colW / 2;
                SLOTS.push({
                    geo: geoFloor,
                    pos: new THREE.Vector3(x, -hh, z),
                    rot: new THREE.Euler(-Math.PI / 2, 0, 0),
                });
                SLOTS.push({
                    geo: geoFloor,
                    pos: new THREE.Vector3(x, hh, z),
                    rot: new THREE.Euler(Math.PI / 2, 0, 0),
                });
            }
            for (let i = 0; i < rows; i++) {
                const y = -hh + i * rowH + rowH / 2;
                SLOTS.push({
                    geo: geoWall,
                    pos: new THREE.Vector3(-hw, y, z),
                    rot: new THREE.Euler(0, Math.PI / 2, 0),
                });
                SLOTS.push({
                    geo: geoWall,
                    pos: new THREE.Vector3(hw, y, z),
                    rot: new THREE.Euler(0, -Math.PI / 2, 0),
                });
            }
        }

        function populate(group: THREE.Group) {
            const takesSlabs = populateIndex % 2 === 0;
            populateIndex++;
            const slabs = group.userData.slabs as THREE.Mesh[];

            for (const slab of slabs) {
                if (!takesSlabs || Math.random() > 0.5) {
                    slab.visible = false;
                    continue;
                }
                slab.visible = true;
                if (Math.random() > 0.5) {
                    slab.material =
                        colorMats[(5 * colorIndex) % colorMats.length];
                    colorIndex++;
                } else if (slab.geometry === geoWall) {
                    slab.material = wallMats[wallIndex % wallMats.length];
                    wallIndex++;
                } else {
                    slab.material = floorMats[floorIndex % floorMats.length];
                    floorIndex++;
                }
            }
        }

        function createSegment(z: number) {
            const group = new THREE.Group();
            group.position.z = z;

            for (let i = 0; i <= cols; i++) {
                const x = -hw + i * colW;
                group.add(tube(geoTubeZ, x, -hh));
                group.add(tube(geoTubeZ, x, hh));
            }
            for (let i = 1; i < rows; i++) {
                const y = -hh + i * rowH;
                group.add(tube(geoTubeZ, -hw, y));
                group.add(tube(geoTubeZ, hw, y));
            }
            group.add(tube(geoTubeX, -hw, -hh));
            group.add(tube(geoTubeX, -hw, hh));
            group.add(tube(geoTubeY, -hw, -hh));
            group.add(tube(geoTubeY, hw, -hh));

            const slabs: THREE.Mesh[] = SLOTS.map((slot) => {
                const m = new THREE.Mesh(slot.geo, colorMats[0]);
                m.position.copy(slot.pos);
                m.rotation.copy(slot.rot);
                m.visible = false;
                group.add(m);
                return m;
            });
            group.userData.slabs = slabs;

            populate(group);
            return group;
        }

        const segments: THREE.Group[] = [];
        for (let i = 0; i < NUM_SEGMENTS; i++) {
            const g = createSegment(-i * SEGMENT_DEPTH);
            scene.add(g);
            segments.push(g);
        }

        const resize = () => {
            const w = Math.max(1, frame.clientWidth);
            const h = Math.max(1, frame.clientHeight);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        const ro = new ResizeObserver(resize);
        ro.observe(frame);
        resize();

        const animate = (now: number) => {
            if (!alive) return;
            raf = requestAnimationFrame(animate);
            const live = motionRef.current?.current;
            if (live?.paused) {
                last = 0;
                return;
            }
            const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
            last = now;

            const cfg = cfgRef.current;
            const target = live ? Math.max(0, live.speed) / 100 : cfg.speed;
            speedNow += SPEED_EASE * (target - speedNow);
            const boosting = pressed && (live?.boost ?? true);
            scrollPos += boosting ? cfg.boost : speedNow;

            const want = -SCROLL_TO_Z * scrollPos - (live?.drift ?? 0);
            camera.position.z += CAMERA_CHASE * (want - camera.position.z);

            const span = NUM_SEGMENTS * SEGMENT_DEPTH;
            const z = camera.position.z;
            for (const seg of segments) {
                if (seg.position.z > z + SEGMENT_DEPTH) {
                    let min = 0;
                    for (const s of segments) min = Math.min(min, s.position.z);
                    seg.position.z = min - SEGMENT_DEPTH;
                    populate(seg);
                } else if (seg.position.z < z - span - SEGMENT_DEPTH) {
                    let max = -999999;
                    for (const s of segments) max = Math.max(max, s.position.z);
                    seg.position.z = max + SEGMENT_DEPTH;
                    populate(seg);
                }
            }

            for (let i = fading.length - 1; i >= 0; i--) {
                const m = fading[i];
                m.opacity = Math.min(1, m.opacity + dt / FADE_IN);
                if (m.opacity >= 1) fading.splice(i, 1);
            }

            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(animate);

        const onDown = () => {
            pressed = true;
        };
        const onUp = () => {
            pressed = false;
        };

        frame.addEventListener("pointerleave", onUp);
        frame.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        // Touch scrolling cancels the pointer instead of releasing it.
        window.addEventListener("pointercancel", onUp);

        return () => {
            alive = false;
            cancelAnimationFrame(raf);
            ro.disconnect();
            frame.removeEventListener("pointerleave", onUp);
            frame.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);

            geoFloor.dispose();
            geoWall.dispose();
            geoTubeZ.dispose();
            geoTubeX.dispose();
            geoTubeY.dispose();
            for (const m of colorMats) m.dispose();
            for (const m of [...floorMats, ...wallMats]) {
                m.map?.dispose();
                m.dispose();
            }
            lineMaterial.dispose();
            renderer.dispose();
        };
    }, [floorUrls, wallUrls, palette, background, lineColor, lineOpacity, grid, fade]);

    return (
        <div
            ref={frameRef}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ display: "block", width: "100%", height: "100%" }}
            />
        </div>
    );
}

const __originkitPresetProps = {
  "fade": 100,
  "grid": 4,
  "boost": 100,
  "speed": 100,
  "colors": [EMPTY_SLAB_COLOR],
  "cellMode": "stretched",
  "lineColor": LINE_COLOR,
  "background": "#000000",
  "tunnelSize": 1,
  "lineOpacity": 50
};

export default function ImageBox(props: Record<string, unknown>) {
  return <__OriginkitBase_ImageBox {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
