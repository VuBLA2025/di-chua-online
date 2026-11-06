import React, { useEffect, useRef } from 'react';
import { ActorSpec, TempleScene, loadDevoteeAssets } from './templeScene';

// Transparent canvas with the 3D devotees. Reports whether the 3D files loaded, so the stage
// can fall back to the 2D sprites when public/assets/3d/ is empty.
export const Temple3D: React.FC<{
  specs: ActorSpec[];
  onReady: (ok: boolean) => void;
  onIncenseLit?: () => void;
  onAway?: (key: string, away: boolean) => void;
  // Gift giver to follow up close, the stage layers that zoom along with it, and the callback when it's over
  spotlightKey?: string | null;
  zoomTargets?: () => HTMLElement[];
  onSpotlightEnd?: () => void;
}> = ({ specs, onReady, onIncenseLit, onAway, spotlightKey = null, zoomTargets, onSpotlightEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const selfRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TempleScene | null>(null);
  const specsRef = useRef(specs);
  specsRef.current = specs;
  const litRef = useRef(onIncenseLit);
  litRef.current = onIncenseLit;
  const awayRef = useRef(onAway);
  awayRef.current = onAway;
  const spotEndRef = useRef(onSpotlightEnd);
  const spotRef = useRef(spotlightKey);
  spotRef.current = spotlightKey;
  spotEndRef.current = onSpotlightEnd;

  useEffect(() => {
    let cancelled = false;
    loadDevoteeAssets()
      .then((assets) => {
        if (cancelled || !canvasRef.current) return;
        const scene = new TempleScene(
          canvasRef.current,
          assets,
          () => litRef.current?.(),
          labelsRef.current ?? undefined,
          (key, away) => awayRef.current?.(key, away)
        );
        scene.onSpotlightEnd = () => spotEndRef.current?.();
        if (selfRef.current) scene.setZoomTargets(zoomTargets?.() ?? [], selfRef.current);
        sceneRef.current = scene;
        scene.sync(specsRef.current);
        scene.setSpotlight(spotRef.current);
        onReady(true);
      })
      .catch((err) => {
        console.info('3D devotees off (no model in /assets/3d/):', err?.message ?? err);
        onReady(false);
      });
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.sync(specs);
  }, [specs]);

  useEffect(() => {
    sceneRef.current?.setSpotlight(spotlightKey);
  }, [spotlightKey]);

  return (
    <div ref={selfRef} className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {/* Name plates that follow people walking up to offer incense (positioned by TempleScene) */}
      <div ref={labelsRef} className="absolute inset-0 pointer-events-none" />
    </div>
  );
};
