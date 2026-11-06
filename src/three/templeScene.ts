/**
 * 2.5D devotees: real skinned 3D characters (Mixamo rig) seen through one fixed camera,
 * drawn on a transparent canvas between the temple background image and the 2D labels.
 * Positions come in stage % (the same points the 2D layout uses), so name plates and
 * chat bubbles stay where they are.
 */
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { retargetClip, usesMixamoRig } from './retarget';

export type StagePoint = { x: number; y: number }; // % of stage width / height; y is the feet line
export type ActorSpec = {
  key: string;
  at: StagePoint;
  mode: 'pray' | 'bow'; // bow = keeps doing lạy
  enter: 'walk' | 'place'; // walk in from the bottom of the aisle, or appear already kneeling
  offer?: string; // a gift id: go up and offer incense once for it, then come back to `at`
  leave?: boolean; // after offering, walk out down the aisle instead of kneeling at `at` (not a top-10 donor)
  label?: { name: string; avatar?: string }; // name plate that follows them while they go up to offer incense
};

// Bronze name plate (same look as the 2D ones) built with DOM APIs; the name is viewer text, so textContent only
function makeNamePlate(label: { name: string; avatar?: string }) {
  const el = document.createElement('div');
  el.className =
    'absolute -translate-x-1/2 -translate-y-full flex items-center gap-1 w-max max-w-[120px] pl-0.5 pr-1.5 rounded-full border border-[#d9a55a] bg-linear-to-b from-[#5a3413] to-[#2a1608] shadow-[0_0_8px_rgba(217,165,90,0.45)] text-[9px] font-temple pointer-events-none';
  if (label.avatar) {
    const img = document.createElement('img');
    img.src = label.avatar;
    img.referrerPolicy = 'no-referrer';
    img.className = 'shrink-0 w-4 h-4 rounded-full object-cover';
    el.appendChild(img);
  } else {
    const initial = document.createElement('span');
    initial.className = 'shrink-0 w-4 h-4 rounded-full bg-[#b07a3a] text-[#fff7e0] text-[8px] font-bold flex items-center justify-center';
    initial.textContent = label.name.slice(0, 1).toUpperCase();
    el.appendChild(initial);
  }
  const name = document.createElement('span');
  name.className = 'truncate font-semibold text-[#fbe7b8] leading-[14px]';
  name.textContent = label.name;
  el.appendChild(name);
  return el;
}

type Clips = {
  walk: THREE.AnimationClip;
  kneel: THREE.AnimationClip;
  kneelDown?: THREE.AnimationClip;
  incense?: THREE.AnimationClip; // stand with joined hands, then kneel: played while holding a lit incense stick
};
export type DevoteeAssets = { model: THREE.Group; clips: Clips };

const BASE = '/assets/3d/';
const HEIGHT = 0.46; // world units a standing person is scaled to (sized against the hall painting)
const WALK_SPEED = 1.3; // world units per second
const AISLE_X = 50;
const AISLE_BOTTOM_Y = 106;
// Offerers stand in a row partway up the steps (not up at the burner table),
// spread wide so five fit without crowding: x offsets from the aisle, in the order spots are filled
const SPOT_ZOOM = 3.6; // how close the camera gets on a gift giver
// Two staggered rows partway up the steps so name plates don't stack: filled in this order, giving
// 1 front, then 1 front + 1 back, 1 front + 2 back, 2 front + 2 back, 2 front + 3 back.
const OFFER_FRONT_Y = 68;
const OFFER_BACK_Y = 63.5;
const OFFER_SPOTS = [
  { dx: 0, y: OFFER_FRONT_Y },
  { dx: -9, y: OFFER_BACK_Y },
  { dx: 9, y: OFFER_BACK_Y },
  { dx: 12, y: OFFER_FRONT_Y },
  { dx: -18, y: OFFER_BACK_Y },
];

// Files exported from Mixamo into public/assets/3d/: di (walk, in place) and khan (kneeling idle) are required;
// quy (stand to kneel) and thaphuong (stand praying then kneel, for lighting incense) are optional.
// nhanvat.fbx (character, with skin) is optional too: without it the body inside khan.fbx is used.
// Mixamo has no kneeling prostration, so lạy is done in code by bending the spine (see Actor.bow).
export async function loadDevoteeAssets(): Promise<DevoteeAssets> {
  const loader = new FBXLoader();
  const groups: Record<string, THREE.Group> = {};
  const clip = async (file: string, required: boolean) => {
    try {
      const g = await loader.loadAsync(BASE + file);
      groups[file] = g;
      return g.animations[0];
    } catch (err) {
      if (required) throw err;
      return undefined;
    }
  };
  const [walk, kneel, kneelDown, incense] = await Promise.all([
    clip('di.fbx', true),
    clip('khan.fbx', true),
    clip('quy.fbx', false),
    clip('thaphuong.fbx', false),
  ]);
  if (!walk || !kneel) throw new Error('missing di.fbx or khan.fbx');
  // The character: nhanvat.fbx or nguoi.fbx when present, otherwise the body that came with khan.fbx (Mixamo "With Skin")
  const own = await loader
    .loadAsync(BASE + 'nhanvat.fbx')
    .catch(() => loader.loadAsync(BASE + 'nguoi.fbx'))
    .catch(() => null);
  const model: THREE.Group = own ?? groups['khan.fbx'];
  model.animations = [];
  let clips: Clips = { walk, kneel, kneelDown, incense };
  if (own && !usesMixamoRig(own)) {
    // Own skeleton (Hips/Spine/Chest/...): rebuild every Mixamo clip for it
    const source = groups['khan.fbx'];
    const r = (c?: THREE.AnimationClip) => (c ? retargetClip(own, source, c) : undefined);
    clips = { walk: r(walk)!, kneel: r(kneel)!, kneelDown: r(kneelDown), incense: r(incense) };
  }
  // Walking is played in place: pin the hips' horizontal travel to the first frame so the code controls movement
  // (keeps the up-down bob of each step). Done on the clip that is actually played, retargeted or not.
  for (const t of clips.walk.tracks) {
    if (!/Hips\.position$/.test(t.name)) continue;
    const v = t.values;
    for (let i = 3; i < v.length; i += 3) {
      v[i] = v[0];
      v[i + 2] = v[2];
    }
  }

  const box = new THREE.Box3().setFromObject(model);
  model.scale.multiplyScalar(HEIGHT / (box.max.y - box.min.y || 1));
  model.traverse((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = false; // skinned bounds are stale once animated
    // An own character keeps its own colors (grey áo tràng); the plain Mixamo mannequin is painted grey-blue
    if (own) return;
    const tint = () => new THREE.MeshStandardMaterial({ color: 0x6d7896, roughness: 0.75, metalness: 0.05 });
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(tint) : tint();
  });
  return { model, clips };
}

// Soft round shadow under each character
const blobTexture = (() => {
  let tex: THREE.Texture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    tex = new THREE.CanvasTexture(c);
    return tex;
  };
})();

// A lit incense stick (thin stick with a glowing tip) held in the right hand while lighting incense
// Three thick incense sticks held in a bundle, tall enough to read from the high camera, with glowing tips
function makeIncenseStick() {
  const g = new THREE.Group();
  const stickMat = new THREE.MeshBasicMaterial({ color: 0xa8321a });
  const tipMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  for (const dx of [-0.018, 0, 0.018]) {
    // Held a quarter of the way up: from just below the hand to well above the head
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 6), stickMat);
    stick.position.set(dx, 0.3, 0);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), tipMat);
    tip.position.set(dx, 0.71, 0);
    g.add(stick, tip);
  }
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.35, depthWrite: false }));
  glow.position.y = 0.71;
  g.add(glow);
  return g;
}

const IDENTITY = new THREE.Quaternion();
const TMP_Q = new THREE.Quaternion();

class Actor {
  root = new THREE.Group();
  private mixer: THREE.AnimationMixer;
  private actions: Partial<Record<keyof Clips, THREE.AnimationAction>> = {};
  private current?: THREE.AnimationAction;
  private path: THREE.Vector3[] = [];
  private state: 'walking' | 'incense' | 'kneeling' = 'kneeling';
  private hand?: THREE.Object3D;
  head?: THREE.Object3D;
  label?: { name: string; avatar?: string };
  plate?: HTMLElement;
  private stick?: THREE.Group;
  // Lạy: spine, chest, neck and head bend forward toward the floor, hold, then come back up
  private bowBones: Array<[THREE.Object3D, number]> = [];
  // Robe panels (nguoi.fbx) follow the legs so kneeling doesn't push the thighs through the robe
  private legParts = new Map<string, THREE.Object3D>();
  private bowT = -1;
  private nextBowIn = 0;
  private onArrive?: () => void;
  private bowsAtBurner = 0;
  private afterBurner?: () => void;
  mode: 'pray' | 'bow' = 'pray';
  target = new THREE.Vector3();

  constructor(assets: DevoteeAssets) {
    const body = cloneSkinned(assets.model);
    this.root.add(body);
    const bend: Record<string, number> = { Spine: 0.7, Spine1: 0.6, Spine2: 0.45, Chest: 0.6, Neck: 0.25, Head: 0.2 }; // radians at full bow (deep, forehead toward the floor)
    body.traverse((o) => {
      if (!this.hand && /(RightHand|HandR)$/.test(o.name)) this.hand = o;
      if (!this.head && /(^|:)Head$/.test(o.name)) this.head = o;
      if (/^(Robe(Upper|Lower)(Front|Back)[LR]|Thigh[LR]|Shin[LR])$/.test(o.name)) this.legParts.set(o.name, o);
      const part = o.name.replace(/^mixamorig:?/, '');
      if (part in bend) this.bowBones.push([o, bend[part]]);
    });
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(HEIGHT * 0.3, 24),
      new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    this.root.add(shadow);

    this.mixer = new THREE.AnimationMixer(body);
    for (const [name, clip] of Object.entries(assets.clips)) {
      if (!clip) continue;
      const action = this.mixer.clipAction(clip);
      if (name === 'kneelDown' || name === 'incense') {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      this.actions[name as keyof Clips] = action;
    }
    this.mixer.addEventListener('finished', (e) => {
      if (e.action === this.actions.incense) {
        // Incense is in the burner and the clip ends kneeling: lạy three times there
        this.setStick(false);
        this.state = 'kneeling';
        this.bowsAtBurner = 3;
        this.nextBowIn = 0.4;
        this.play('kneel', 0.4);
      } else if (e.action === this.actions.kneelDown) {
        this.play('kneel', 0.4, true);
      }
    });
  }

  private play(name: keyof Clips, fade = 0.3, randomStart = false) {
    const next = this.actions[name];
    if (!next || next === this.current) return;
    next.reset();
    if (randomStart) next.time = Math.random() * next.getClip().duration;
    next.play();
    if (this.current) this.current.crossFadeTo(next, fade, false);
    this.current = next;
  }

  private setStick(on: boolean) {
    if (!this.hand) return;
    if (on && !this.stick) {
      this.stick = makeIncenseStick();
      // Bone space is in the model's original units (cm for Mixamo), so undo the body scale
      this.stick.scale.setScalar(1 / this.root.children[0].scale.x);
      this.hand.add(this.stick);
    } else if (!on && this.stick) {
      this.hand.remove(this.stick);
      this.stick = undefined;
    }
  }

  // Kneel facing the altar (away from the camera, so we see their back)
  kneelHere(withKneelDown: boolean) {
    this.root.rotation.y = Math.PI;
    this.state = 'kneeling';
    // Everyone bows over and over on their own clock: a random first start, then a short rest between lạy,
    // so the hall is always bowing but never in unison (0.5-1.5 s rest)
    this.nextBowIn = Math.random() * 4;
    if (withKneelDown && this.actions.kneelDown) this.play('kneelDown', 0.3);
    else this.play('kneel', 0.3, true);
  }

  walk(points: THREE.Vector3[], onArrive?: () => void) {
    this.path = points.map((p) => p.clone());
    this.onArrive = onArrive;
    this.state = 'walking';
    this.bowsAtBurner = 0;
    this.play('walk', 0.3);
  }

  lastOffer?: string;
  busy = false; // in the middle of offering incense

  // Lighting incense or doing the three bows at the burner (not walking there or back)
  isOfferingAtBurner() {
    return this.busy && this.state !== 'walking';
  }
  spotIndex = -1; // which offering spot they stand on while busy
  onDone?: () => void;

  // Offering incense: walk up the steps to the burner, stand and vái with a lit stick (the clip kneels at the end),
  // lạy three times there, then walk `back` and kneel, or leave and disappear
  offerIncense(toBurner: THREE.Vector3[], back: THREE.Vector3[], onLit: () => void, leave: boolean) {
    this.busy = true;
    this.bowT = -1;
    this.walk(toBurner, () => {
      this.root.rotation.y = Math.PI;
      this.afterBurner = () =>
        this.walk(back, () => {
          this.busy = false;
          this.onDone?.();
          if (leave) this.root.visible = false;
          else this.kneelHere(true);
        });
      onLit();
      if (!this.actions.incense) {
        this.kneelHere(true);
        this.bowsAtBurner = 3;
        return;
      }
      this.state = 'incense';
      this.setStick(true);
      this.play('incense', 0.3);
    });
  }

  private skipped = 0; // seconds not yet given to the mixer while throttled
  private tick = Math.floor(Math.random() * 3);

  update(dt: number) {
    // Someone just kneeling (not walking, bowing or offering) barely moves: animate them every third frame.
    // With ~100 people this keeps each frame light so the walkers and bowers stay smooth.
    if (this.state === 'kneeling' && this.bowT < 0 && !this.busy && !this.stick) {
      this.skipped += dt;
      if (++this.tick % 3) return;
      dt = this.skipped;
    }
    this.skipped = 0;
    this.mixer.update(dt);
    if (this.state === 'walking') {
      let step = WALK_SPEED * dt;
      while (step > 0 && this.path.length) {
        const to = this.path[0];
        const d = to.clone().sub(this.root.position);
        d.y = 0;
        const len = d.length();
        if (len > 0.001) this.root.rotation.y = Math.atan2(d.x, d.z);
        if (len <= step) {
          this.root.position.copy(to);
          this.path.shift();
          step -= len;
        } else {
          this.root.position.add(d.multiplyScalar(step / len));
          step = 0;
        }
      }
      if (!this.path.length) {
        const arrive = this.onArrive ?? (() => this.kneelHere(true));
        this.onArrive = undefined;
        arrive();
      }
    } else if (this.state === 'kneeling' && this.current === this.actions.kneel) {
      // Occasional lạy while kneeling; the incense offerer bows over and over
      this.nextBowIn -= dt;
      if (this.nextBowIn <= 0 && this.bowT < 0) {
        this.bowT = 0;
        this.nextBowIn = this.bowsAtBurner > 0 ? 0.4 : 0.5 + Math.random();
      }
    }
    this.applyBow(dt);
    this.followRobe();
    this.keepStickUpright();
  }

  // The sticks stand straight up whatever the hand is doing (undo the hand's world rotation)
  private keepStickUpright() {
    if (!this.stick || !this.hand) return;
    this.hand.updateWorldMatrix(true, false);
    this.stick.quaternion.copy(this.hand.getWorldQuaternion(TMP_Q).invert());
  }

  // [panel, leg bone, how much of the leg's rotation it takes], built once from the rig
  private robeFollow?: Array<[THREE.Object3D, THREE.Object3D, number]>;

  private followRobe() {
    if (!this.robeFollow) {
      this.robeFollow = [];
      for (const side of ['L', 'R']) {
        const thigh = this.legParts.get('Thigh' + side);
        const shin = this.legParts.get('Shin' + side);
        if (!thigh || !shin) continue;
        const follow: Array<[string, THREE.Object3D, number]> = [
          ['RobeUpperFront' + side, thigh, 0.9],
          ['RobeUpperBack' + side, thigh, 0.45],
          ['RobeLowerFront' + side, shin, 0.6],
          ['RobeLowerBack' + side, shin, 0.3],
        ];
        for (const [name, leg, amount] of follow) {
          const panel = this.legParts.get(name);
          if (panel) this.robeFollow.push([panel, leg, amount]);
        }
      }
    }
    for (const [panel, leg, amount] of this.robeFollow) panel.quaternion.slerpQuaternions(IDENTITY, leg.quaternion, amount);
  }

  // Added on top of the kneeling pose after the mixer runs: ease down, hold at the floor, ease back up
  private applyBow(dt: number) {
    if (this.bowT < 0) return;
    const DOWN = 0.9, HOLD = 0.7, UP = 1.0;
    this.bowT += dt;
    const t = this.bowT;
    let w: number;
    if (t < DOWN) w = 0.5 - 0.5 * Math.cos((Math.PI * t) / DOWN);
    else if (t < DOWN + HOLD) w = 1;
    else if (t < DOWN + HOLD + UP) w = 0.5 + 0.5 * Math.cos((Math.PI * (t - DOWN - HOLD)) / UP);
    else {
      this.bowT = -1;
      // After the third lạy at the burner, go down to the mat
      if (this.bowsAtBurner > 0 && --this.bowsAtBurner === 0) {
        this.afterBurner?.();
        this.afterBurner = undefined;
      }
      return;
    }
    for (const [bone, angle] of this.bowBones) bone.rotation.x += angle * w;
  }

  dispose() {
    this.setStick(false);
    this.mixer.stopAllAction();
  }
}

export class TempleScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 9 / 16, 0.1, 200);
  private floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private raycaster = new THREE.Raycaster();
  private actors = new Map<string, Actor>();
  private clock = new THREE.Clock();
  private frame = 0;

  // Spotlight: a gift giver is followed up close while they walk up and offer incense. The 3D view renders only
  // the zoomed region (camera view offset, so the people stay sharp), and the same zoom is put on the painted
  // background and floor layers (zoomEls) as a CSS transform; this scene's own canvas and name plates (selfEl)
  // get the inverse transform so they keep filling the screen.
  private viewCam = new THREE.PerspectiveCamera();
  private zoom = 1;
  private cx = 0.5;
  private cy = 0.5;
  private spotKey: string | null = null;
  private spotReachedBurner = false;
  private zoomEls: HTMLElement[] = [];
  private selfEl?: HTMLElement;
  onSpotlightEnd: () => void = () => {};

  setZoomTargets(world: HTMLElement[], self: HTMLElement) {
    this.zoomEls = world;
    this.selfEl = self;
  }

  setSpotlight(key: string | null) {
    if (key === this.spotKey) return;
    this.spotKey = key;
    this.spotReachedBurner = false;
    this.spotStartedAt = performance.now();
  }

  private spotStartedAt = 0;

  private updateSpotlight(dt: number) {
    const actor = this.spotKey ? this.actors.get(this.spotKey) : undefined;
    let tz = 1;
    if (actor && actor.root.visible) {
      // Close in while they walk up and offer; once they turn back after the bows, pull out and end
      const atBurner = actor.isOfferingAtBurner();
      if (atBurner) this.spotReachedBurner = true;
      const secs = (performance.now() - this.spotStartedAt) / 1000;
      // Done when they turn back after the bows; also give up on someone who never sets off, or after 45 s
      if ((this.spotReachedBurner && !atBurner) || (!actor.busy && secs > 4) || secs > 45) {
        this.spotKey = null;
        this.onSpotlightEnd();
      } else {
        tz = SPOT_ZOOM;
        const p = (actor.head ?? actor.root).getWorldPosition(new THREE.Vector3());
        p.y -= HEIGHT * 0.15; // frame the whole body, a little below the head
        p.project(this.camera);
        const k = Math.min(1, dt * 2.2);
        this.cx += ((p.x + 1) / 2 - this.cx) * k;
        this.cy += ((1 - p.y) / 2 - this.cy) * k;
      }
    } else if (this.spotKey) {
      this.spotKey = null;
      this.onSpotlightEnd();
    }
    this.zoom += (tz - this.zoom) * Math.min(1, dt * 1.6);
    if (tz === 1 && this.zoom < 1.002) this.zoom = 1;
    const half = 0.5 / this.zoom;
    const x0 = Math.min(Math.max(this.cx - half, 0), 1 - 2 * half);
    const y0 = Math.min(Math.max(this.cy - half, 0), 1 - 2 * half);
    const world = this.zoom === 1 ? '' : `scale(${this.zoom}) translate(${-x0 * 100}%, ${-y0 * 100}%)`;
    for (const el of this.zoomEls) {
      el.style.transformOrigin = '0 0';
      el.style.transform = world;
    }
    if (this.selfEl) {
      this.selfEl.style.transformOrigin = '0 0';
      this.selfEl.style.transform = this.zoom === 1 ? '' : `translate(${x0 * 100}%, ${y0 * 100}%) scale(${1 / this.zoom})`;
    }
    if (this.zoom > 1) {
      const size = this.renderer.getSize(new THREE.Vector2());
      this.viewCam.copy(this.camera);
      this.viewCam.setViewOffset(size.x, size.y, x0 * size.x, y0 * size.y, size.x / this.zoom, size.y / this.zoom);
    }
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private assets: DevoteeAssets,
    private onIncenseLit: () => void = () => {},
    private labelLayer?: HTMLElement,
    private onAway: (key: string, away: boolean) => void = () => {} // a seated person left their cushion to offer incense
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Fixed high camera looking down the hall toward the altar, like the reference video
    this.camera.position.set(0, 9, 13);
    this.camera.lookAt(0, 0, -6);
    this.scene.add(new THREE.HemisphereLight(0xfff0d6, 0x3a1f0b, 1.4));
    const key = new THREE.DirectionalLight(0xffd9a0, 1.6);
    key.position.set(2, 10, 6);
    this.scene.add(key);
    this.resize();
    let frames = 0;
    const loop = () => {
      this.frame = requestAnimationFrame(loop);
      if (frames++ % 30 === 0) this.resize();
      const dt = Math.min(this.clock.getDelta(), 0.1);
      for (const a of this.actors.values()) a.update(dt);
      this.updateSpotlight(dt);
      this.renderer.render(this.scene, this.zoom > 1.001 ? this.viewCam : this.camera);
      this.placePlates();
    };
    loop();
  }

  // Match the canvas size; render at the on-screen size even when the stage is CSS-zoomed for OBS/LIVE Studio
  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    const zoom = this.canvas.getBoundingClientRect().width / w || 1;
    // Never render wider than the 1080 px the live is sent at: extra pixels cost frames and nobody sees them
    const ratio = Math.min(window.devicePixelRatio * zoom, 2, 1080 / w);
    if (this.renderer.getPixelRatio() !== ratio) this.renderer.setPixelRatio(ratio);
    const size = this.renderer.getSize(new THREE.Vector2());
    if (size.x !== w || size.y !== h) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }

  // Stage % point -> spot on the floor seen there
  private toWorld(p: StagePoint) {
    this.raycaster.setFromCamera(new THREE.Vector2((p.x / 100) * 2 - 1, -((p.y / 100) * 2 - 1)), this.camera);
    const hit = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.floor, hit) ?? hit.set(0, 0, 0);
  }

  sync(specs: ActorSpec[]) {
    const wanted = new Set(specs.map((s) => s.key));
    for (const [key, actor] of this.actors) {
      if (!wanted.has(key)) {
        actor.plate?.remove();
        this.scene.remove(actor.root);
        actor.dispose();
        this.actors.delete(key);
      }
    }
    for (const spec of specs) {
      const target = this.toWorld(spec.at);
      let actor = this.actors.get(spec.key);
      if (!actor) {
        actor = new Actor(this.assets);
        actor.mode = spec.mode;
        actor.label = spec.label;
        actor.target.copy(target);
        this.actors.set(spec.key, actor);
        this.scene.add(actor.root);
        if (spec.offer) {
          // Arrives with a gift: from the back of the hall straight up to the burner
          actor.root.position.copy(this.toWorld({ x: AISLE_X, y: AISLE_BOTTOM_Y }));
          this.startOffer(actor, spec);
          continue;
        }
        if (spec.enter === 'walk') {
          actor.root.position.copy(this.toWorld({ x: AISLE_X, y: AISLE_BOTTOM_Y }));
          // Up the aisle, then sideways to the seat (an offering guest goes straight on to the burner below)
          if (!spec.offer) actor.walk([this.toWorld({ x: AISLE_X, y: spec.at.y }), target]);
        } else {
          actor.root.position.copy(target);
          actor.kneelHere(false);
        }
        continue;
      }
      actor.mode = spec.mode;
      if (spec.label && (!actor.label || actor.label.name !== spec.label.name || actor.label.avatar !== spec.label.avatar)) {
        actor.label = spec.label;
        actor.plate?.remove();
        actor.plate = undefined;
      }
      if (actor.busy) continue;
      if (spec.offer && actor.lastOffer !== spec.offer) {
        this.startOffer(actor, spec);
        continue;
      }
      if (actor.target.distanceTo(target) > 0.05) {
        // Moved to another mat (e.g. chủ lễ -> small mat): stand up and walk there
        actor.target.copy(target);
        actor.walk([target]);
      }
    }
  }

  // Name plates float above the head of whoever is offering incense (seated top-10 donors have 2D plates instead)
  private placePlates() {
    if (!this.labelLayer) return;
    const p = new THREE.Vector3();
    for (const a of this.actors.values()) {
      const show = a.busy && a.root.visible && a.label && a.head;
      if (!show) {
        if (a.plate) a.plate.style.display = 'none';
        continue;
      }
      if (!a.plate) {
        a.plate = makeNamePlate(a.label!);
        this.labelLayer.appendChild(a.plate);
      }
      a.head!.getWorldPosition(p);
      p.y += HEIGHT * 0.12;
      p.project(this.zoom > 1.001 ? this.viewCam : this.camera);
      a.plate.style.display = '';
      a.plate.style.left = `${((p.x + 1) / 2) * 100}%`;
      a.plate.style.top = `${((1 - p.y) / 2) * 100}%`;
    }
  }

  // Someone gave a gift: their actor walks the aisle and the steps to the burner, offers incense, and comes back
  private startOffer(actor: Actor, spec: ActorSpec) {
    actor.lastOffer = spec.offer;
    actor.onDone = () => this.onAway(spec.key, false);
    this.onAway(spec.key, true);
    const aisleAtSeat = this.toWorld({ x: AISLE_X, y: spec.at.y });
    // Up to five offer at once, each on their own spot (first free one) in the staggered rows
    const taken = new Set([...this.actors.values()].filter((a) => a !== actor && a.busy).map((a) => a.spotIndex));
    actor.spotIndex = OFFER_SPOTS.findIndex((_, i) => !taken.has(i));
    const s = OFFER_SPOTS[Math.max(0, actor.spotIndex)];
    const spot = { x: AISLE_X + s.dx, y: s.y };
    const aisleFront = this.toWorld({ x: AISLE_X, y: OFFER_FRONT_Y + 2.5 });
    const toBurner = [aisleAtSeat, aisleFront, this.toWorld(spot)];
    const back = spec.leave
      ? [aisleFront, this.toWorld({ x: AISLE_X, y: AISLE_BOTTOM_Y })]
      : [aisleFront, aisleAtSeat, actor.target.clone()];
    actor.offerIncense(spec.leave ? toBurner.slice(1) : toBurner, back, this.onIncenseLit, Boolean(spec.leave));
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    for (const a of this.actors.values()) {
      a.plate?.remove();
      a.dispose();
    }
    this.actors.clear();
    this.renderer.dispose();
  }
}
