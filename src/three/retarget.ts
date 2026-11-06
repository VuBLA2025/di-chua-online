/**
 * Moves Mixamo animations onto a character with its own skeleton (e.g. nguoi.fbx: Hips/Spine/Chest/...).
 * Both rigs must share a T-pose bind. For every frame, each mapped Mixamo bone's world rotation change
 * from its bind pose is applied to the matching target bone on top of that bone's own bind rotation.
 */
import * as THREE from 'three';

// target bone name -> Mixamo bone name (without the "mixamorig" prefix)
export const MIXAMO_MAP: Record<string, string> = {
  Hips: 'Hips',
  Spine: 'Spine',
  Chest: 'Spine2',
  Neck: 'Neck',
  Head: 'Head',
  ClavicleL: 'LeftShoulder',
  UpperArmL: 'LeftArm',
  ForearmL: 'LeftForeArm',
  HandL: 'LeftHand',
  ClavicleR: 'RightShoulder',
  UpperArmR: 'RightArm',
  ForearmR: 'RightForeArm',
  HandR: 'RightHand',
  ThighL: 'LeftUpLeg',
  ShinL: 'LeftLeg',
  FootL: 'LeftFoot',
  ThighR: 'RightUpLeg',
  ShinR: 'RightLeg',
  FootR: 'RightFoot',
};

// Bone -> next bone along its limb, used to read which way each bone points
const CHAIN_CHILD: Record<string, string> = {
  Spine: 'Chest',
  Chest: 'Neck',
  Neck: 'Head',
  ClavicleL: 'UpperArmL',
  UpperArmL: 'ForearmL',
  ForearmL: 'HandL',
  ClavicleR: 'UpperArmR',
  UpperArmR: 'ForearmR',
  ForearmR: 'HandR',
  ThighL: 'ShinL',
  ShinL: 'FootL',
  ThighR: 'ShinR',
  ShinR: 'FootR',
};

const bonesByName = (root: THREE.Object3D) => {
  const map = new Map<string, THREE.Bone>();
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone) map.set(o.name.replace(/^mixamorig:?/, ''), o as THREE.Bone);
  });
  return map;
};

export const usesMixamoRig = (root: THREE.Object3D) => {
  let found = false;
  root.traverse((o) => {
    if (/^mixamorig/.test(o.name)) found = true;
  });
  return found;
};

export function retargetClip(target: THREE.Object3D, source: THREE.Object3D, clip: THREE.AnimationClip, fps = 30) {
  const src = bonesByName(source);
  const tgt = bonesByName(target);
  const pairs = Object.entries(MIXAMO_MAP)
    .map(([t, s]) => [tgt.get(t), src.get(s)] as const)
    .filter((p): p is readonly [THREE.Bone, THREE.Bone] => Boolean(p[0] && p[1]));

  source.updateMatrixWorld(true);
  target.updateMatrixWorld(true);
  // Pose the target like the Mixamo bind (T-pose): turn each limb bone so it points the same way as its
  // Mixamo counterpart. Only then do the per-frame rotation changes land on the right limbs.
  // (nguoi.fbx stands with arms hanging; Mixamo stands with arms straight out.)
  const v = () => new THREE.Vector3();
  for (const [tName, cName] of Object.entries(CHAIN_CHILD)) {
    const t = tgt.get(tName), tc = tgt.get(cName);
    const s = src.get(MIXAMO_MAP[tName]), sc = src.get(MIXAMO_MAP[cName]);
    if (!t || !tc || !s || !sc) continue;
    const want = sc.getWorldPosition(v()).sub(s.getWorldPosition(v())).normalize();
    const have = tc.getWorldPosition(v()).sub(t.getWorldPosition(v())).normalize();
    const turn = new THREE.Quaternion().setFromUnitVectors(have, want);
    const world = turn.multiply(t.getWorldQuaternion(new THREE.Quaternion()));
    const parentWorld = t.parent ? t.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
    t.quaternion.copy(parentWorld.invert().multiply(world));
    t.updateMatrixWorld(true);
  }
  const restLocal = new Map(pairs.map(([t]) => [t, t.quaternion.clone()]));
  const q = () => new THREE.Quaternion();
  const srcBind = new Map(pairs.map(([, s]) => [s, s.getWorldQuaternion(q())]));
  const tgtBind = new Map(pairs.map(([t]) => [t, t.getWorldQuaternion(q())]));

  // Hips travel (kneeling lowers the hips) scaled from Mixamo units to the target's
  const srcHips = src.get('Hips');
  const tgtHips = tgt.get('Hips');
  const srcHipsRest = srcHips?.getWorldPosition(new THREE.Vector3());
  const tgtHipsRest = tgtHips?.getWorldPosition(new THREE.Vector3());
  const scale = srcHipsRest && tgtHipsRest && srcHipsRest.y ? tgtHipsRest.y / srcHipsRest.y : 1;
  const tgtHipsLocalRest = tgtHips?.position.clone();

  const mixer = new THREE.AnimationMixer(source);
  const action = mixer.clipAction(clip);
  action.play();

  const frames = Math.max(2, Math.round(clip.duration * fps) + 1);
  const times: number[] = [];
  const rot = new Map(pairs.map(([t]) => [t, [] as number[]]));
  const hipsPos: number[] = [];

  for (let f = 0; f < frames; f++) {
    const time = Math.min(clip.duration, f / fps);
    times.push(time);
    mixer.setTime(time);
    source.updateMatrixWorld(true);
    // Parents first (pairs follow the hierarchy order of MIXAMO_MAP), so parent world rotations are current
    for (const [t, s] of pairs) {
      const delta = s.getWorldQuaternion(q()).multiply(srcBind.get(s)!.clone().invert());
      const world = delta.multiply(tgtBind.get(t)!);
      const parentWorld = t.parent ? t.parent.getWorldQuaternion(q()) : q();
      const local = parentWorld.invert().multiply(world);
      t.quaternion.copy(local);
      t.updateMatrixWorld(true);
      rot.get(t)!.push(local.x, local.y, local.z, local.w);
    }
    if (srcHips && tgtHips && srcHipsRest && tgtHipsLocalRest) {
      const moved = srcHips.getWorldPosition(new THREE.Vector3()).sub(srcHipsRest).multiplyScalar(scale);
      // World travel into the hips' parent space (the target may be turned or scaled differently)
      if (tgtHips.parent) moved.applyQuaternion(tgtHips.parent.getWorldQuaternion(q()).invert()).divide(tgtHips.parent.getWorldScale(new THREE.Vector3()));
      const p = tgtHipsLocalRest.clone().add(moved);
      hipsPos.push(p.x, p.y, p.z);
    }
  }
  mixer.stopAllAction();
  mixer.uncacheRoot(source);
  // Leave the target back in its bind pose
  for (const [t] of pairs) t.quaternion.copy(restLocal.get(t)!);
  if (tgtHips && tgtHipsLocalRest) tgtHips.position.copy(tgtHipsLocalRest);
  target.updateMatrixWorld(true);

  const tracks: THREE.KeyframeTrack[] = pairs.map(([t]) => new THREE.QuaternionKeyframeTrack(`${t.name}.quaternion`, times, rot.get(t)!));
  if (tgtHips && hipsPos.length) tracks.push(new THREE.VectorKeyframeTrack(`${tgtHips.name}.position`, times, hipsPos));
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}
