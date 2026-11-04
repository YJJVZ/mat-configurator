"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Arrow, Circle, Group, Image as KImage, Layer, Line, Rect, Shape, Stage, Text } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { CARD_SIZE, CORNER_RADIUS_CM } from "@/config/catalog";
import { getDesign } from "@/config/designs";
import { coverScale } from "@/lib/imageQuality";
import {
  DESK_VIEW, DEMO_CARD_IDS, defaultCardPos, deskLayout, overflowing, peripheralRect, playmatZones, visiblePeripherals,
} from "@/lib/geometry";
import { stageRegistry } from "@/lib/stageRegistry";
import { clamp } from "@/lib/utils";
import { IDENTITY, useConfigurator } from "@/store/useConfigurator";
import type { ConfigState } from "@/types/config";
import { DeviceShape, FictionalCard } from "./devices";
import { fabricTexture, woodTexture, WOOD_PX_PER_CM } from "@/lib/textures";

const asImg = (cv: HTMLCanvasElement) => cv as unknown as HTMLImageElement;

const r1 = (n: number) => Math.round(n * 10) / 10;

function roundedClip(W: number, D: number, r: number) {
  return (ctx: Konva.Context) => {
    ctx.beginPath();
    if (r > 0) {
      ctx.moveTo(r, 0); ctx.lineTo(W - r, 0); ctx.arcTo(W, 0, W, r, r);
      ctx.lineTo(W, D - r); ctx.arcTo(W, D, W - r, D, r);
      ctx.lineTo(r, D); ctx.arcTo(0, D, 0, D - r, r);
      ctx.lineTo(0, r); ctx.arcTo(0, 0, r, 0, r); ctx.closePath();
    } else ctx.rect(0, 0, W, D);
  };
}

function Artwork({ c, draggable }: { c: ConfigState; draggable: boolean }) {
  const setTransform = useConfigurator((s) => s.setTransform);
  const useUpload = c.designSource === "upload" && !!c.upload;
  const src = useUpload ? c.upload!.dataUrl : getDesign(c.designId).src;
  const [img] = useImage(src);
  if (!img) return null;
  const t = useUpload ? c.imageTransform : IDENTITY;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const cs = coverScale({ w: iw, h: ih }, { w: c.width, h: c.depth }, t.rotation);
  return (
    <KImage
      image={img} x={c.width / 2 + t.x} y={c.depth / 2 + t.y} offsetX={iw / 2} offsetY={ih / 2}
      scaleX={cs * t.scale} scaleY={cs * t.scale} rotation={t.rotation}
      draggable={useUpload && draggable} listening={useUpload && draggable}
      onDragEnd={(e) => setTransform({ x: r1(e.target.x() - c.width / 2), y: r1(e.target.y() - c.depth / 2) })}
    />
  );
}

export function PreviewStage() {
  const c = useConfigurator((s) => s.config);
  const view = useConfigurator((s) => s.view);
  const setupMode = useConfigurator((s) => s.setupMode);
  // Le cadrage n'a de sens qu'avec une image importée active.
  const framing = useConfigurator((s) => s.framing && s.config.designSource === "upload" && !!s.config.upload);
  const { setDevicePos, setCardPos, patchPlaymat, setTransform } = useConfigurator.getState();

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ w: 800, h: 520 });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: Math.max(240, el.clientWidth), h: Math.max(240, el.clientHeight) }));
    ro.observe(el);
    setSize({ w: Math.max(240, el.clientWidth), h: Math.max(240, el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!c.rgb || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setPhase((p) => (p + 4) % 360), 70);
    return () => clearInterval(id);
  }, [c.rgb]);

  const W = c.width, D = c.depth;
  const isDesk = c.product === "deskmat";
  // « Vue produit » = le tapis seul : jamais de setup ni d'outils de zones.
  const setupOn = setupMode && view === "scene" && !framing;
  const showDevices = setupOn && isDesk;
  const showZonesTools = setupOn && !isDesk;
  const radius = c.corners === "rounded" ? CORNER_RADIUS_CM : 0;
  const devices = useMemo(() => (showDevices ? visiblePeripherals(c) : []), [c, showDevices]);

  // Cadrage. « En situation » : cadre FIXE sur le bureau de référence (même échelle pour toutes les tailles,
  // c'est le tapis qui change). « Vue produit » : cadré sur le tapis.
  const desk = deskLayout(c);
  const bounds = useMemo(() => {
    let x0 = 0, y0 = 0, x1 = W, y1 = D;
    if (view === "scene") {
      x0 = Math.min(DESK_VIEW.x0 - desk.mat.x, -2); y0 = Math.min(DESK_VIEW.y0 - desk.mat.y, -2);
      x1 = Math.max(DESK_VIEW.x1 - desk.mat.x, W + 2); y1 = Math.max(DESK_VIEW.y1 - desk.mat.y, D + 2);
    } else { x0 -= 4; y0 -= 4; x1 += 4; y1 += 4; }
    devices.forEach((id) => {
      const r = peripheralRect(c, id);
      x0 = Math.min(x0, r.x - 1); y0 = Math.min(y0, r.y - 1); x1 = Math.max(x1, r.x + r.w + 1); y1 = Math.max(y1, r.y + r.h + 1);
    });
    return { x0, y0, x1, y1 };
  }, [W, D, view, devices, c, desk.mat.x, desk.mat.y]);

  const pad = 28;
  // Pendant le cadrage, on garde de la place pour le bandeau du haut et les réglages sous le tapis.
  const padTop = framing ? 96 : 0, padBottom = framing ? 230 : 0;
  const availH = Math.max(120, size.h - padTop - padBottom);
  const s = Math.max(0.5, Math.min((size.w - pad * 2) / (bounds.x1 - bounds.x0), (availH - pad * 2) / (bounds.y1 - bounds.y0)));
  const ox = size.w / 2 - ((bounds.x0 + bounds.x1) / 2) * s;
  const oy = padTop + availH / 2 - ((bounds.y0 + bounds.y1) / 2) * s;
  const matPx = { x: ox, y: oy, w: W * s, h: D * s };

  useEffect(() => {
    stageRegistry.stage = stageRef.current;
    stageRegistry.matRect = matPx;
  });

  const design = getDesign(c.designId);
  const edgeColor = c.edge === "black" ? "#16171a" : c.edge === "white" ? "#f4f4f2" : c.edgeColor;
  const threadColor = c.edge === "white" ? "#b9b9b4" : "#ffffff";
  const printInset = c.edge === "none" ? 0 : 0.6;
  const zones = c.product === "playmat" ? playmatZones(c) : [];
  const zonesOn = c.product === "playmat" && c.playmat.zonesVisible && zones.length > 0;
  const textOn = c.product === "playmat" && c.playmat.text.trim().length > 0;
  const textPos = c.playmat.textPos ?? { x: W / 2, y: D - 4 };
  const fs = clamp(D * 0.07, 1.6, 3);
  // L'image ne se déplace que pendant le cadrage (proposé à l'import, ou via « Cadrer l'image »).
  const canDragImage = framing && c.designSource === "upload" && !!c.upload;

  const zoneNodes = (
    <>
      {zonesOn && zones.map((z) => (
        <Group key={z.id} x={z.x} y={z.y} listening={false}>
          <Rect width={z.w} height={z.h} cornerRadius={0.4} fill={c.playmat.zoneColor} opacity={0.07} />
          <Rect width={z.w} height={z.h} cornerRadius={0.4} stroke={c.playmat.zoneColor} strokeWidth={0.14} dash={[0.6, 0.35]} opacity={0.9} />
          <Text text={z.label} width={z.w} y={z.h / 2 - 0.5} align="center" fontSize={0.95} fill={c.playmat.zoneColor} opacity={0.85} />
        </Group>
      ))}
    </>
  );
  const textNode = textOn && (
    <Text
      text={c.playmat.text} x={textPos.x - (W * 0.4)} y={textPos.y - fs / 2} width={W * 0.8} align="center" fontSize={fs}
      fontStyle="bold" letterSpacing={fs * 0.08} fill={c.playmat.textColor}
      draggable
      onDragEnd={(e) => patchPlaymat({ textPos: { x: r1(e.target.x() + W * 0.4), y: r1(e.target.y() + fs / 2) } })}
    />
  );

  return (
    <div
      ref={wrapRef}
      className="studio-backdrop absolute inset-0 overflow-hidden"
      style={{
        cursor: canDragImage ? "grab" : "default", touchAction: "none",
      }}
    >
      <Stage
        ref={stageRef} width={size.w} height={size.h}
        onWheel={(e) => {
          if (!canDragImage) return;
          e.evt.preventDefault();
          setTransform({ scale: clamp(Math.round((c.imageTransform.scale * (e.evt.deltaY > 0 ? 0.95 : 1.05)) * 100) / 100, 1, 5) });
        }}
      >
        {/* SCENE : bureau + ombre (jamais exporté) */}
        <Layer name="scene" listening={false}>
          {view === "scene" && (
            <>
              {/* Plateau de bureau en bois, à l'échelle réelle */}
              <Rect width={size.w} height={size.h} fillPatternImage={asImg(woodTexture())}
                fillPatternScale={{ x: s / WOOD_PX_PER_CM, y: s / WOOD_PX_PER_CM }} fillPatternX={ox - (desk.mat.x + 100) * s} fillPatternY={oy - (desk.mat.y + 60) * s} />
              {/* Lumière de fenêtre (haut-gauche) et chute de lumière vers les bords */}
              <Rect width={size.w} height={size.h}
                fillRadialGradientStartPoint={{ x: size.w * 0.35, y: size.h * 0.2 }} fillRadialGradientStartRadius={0}
                fillRadialGradientEndPoint={{ x: size.w * 0.35, y: size.h * 0.2 }} fillRadialGradientEndRadius={Math.max(size.w, size.h) * 1.05}
                fillRadialGradientColorStops={[0, "rgba(255,244,228,0.22)", 0.5, "rgba(0,0,0,0.05)", 1, "rgba(0,0,0,0.4)"]} />
            </>
          )}
          <Group x={ox} y={oy} scaleX={s} scaleY={s}>
            {/* Ombre ambiante large + ombre de contact serrée */}
            <Rect width={W} height={D} cornerRadius={radius} fill="#000"
              shadowColor="#000" shadowBlur={view === "scene" ? 2.5 : 4} shadowOffsetX={0.4} shadowOffsetY={view === "scene" ? 1.2 : 2.2} shadowOpacity={view === "scene" ? 0.4 : 0.3} />
            <Rect width={W} height={D} cornerRadius={radius} fill="#000"
              shadowColor="#000" shadowBlur={0.3} shadowOffsetY={0.15} shadowOpacity={0.6} />
            {/* Tranche : base caoutchouc visible sous le bord avant (épaisseur réelle) */}
            <Rect x={0.05} y={c.thickness / 10} width={W - 0.1} height={D} cornerRadius={radius} fill="#141416" />
          </Group>
        </Layer>

        {/* MAT : visuel imprimé du tapis */}
        <Layer name="mat">
          <Group x={ox} y={oy} scaleX={s} scaleY={s} clipFunc={roundedClip(W, D, radius)}>
            <Rect width={W} height={D} fill={c.designSource === "upload" ? "#ffffff" : design.swatch} listening={false} />
            <Artwork c={c} draggable={canDragImage} />
            {c.edge !== "none" ? (
              <>
                <Rect x={0.3} y={0.3} width={W - 0.6} height={D - 0.6} cornerRadius={Math.max(radius - 0.3, 0)} stroke={edgeColor} strokeWidth={0.6} listening={false} />
                {/* Relief de la couture : arête intérieure ombrée, arête extérieure éclairée */}
                <Rect x={0.6} y={0.6} width={W - 1.2} height={D - 1.2} cornerRadius={Math.max(radius - 0.6, 0)} stroke="#000" strokeWidth={0.06} opacity={0.35} listening={false} />
                <Rect x={0.05} y={0.05} width={W - 0.1} height={D - 0.1} cornerRadius={radius} stroke="#fff" strokeWidth={0.04} opacity={0.25} listening={false} />
                <Rect x={0.3} y={0.3} width={W - 0.6} height={D - 0.6} cornerRadius={Math.max(radius - 0.3, 0)} stroke={threadColor} strokeWidth={0.09} dash={[0.22, 0.1]} opacity={0.7} listening={false} />
              </>
            ) : (
              <Rect x={0.04} y={0.04} width={W - 0.08} height={D - 0.08} cornerRadius={radius} stroke="#000" strokeWidth={0.08} opacity={0.18} listening={false} />
            )}
            {/* FINITION (aperçu seulement, masquée à l'export) : grain du tissu, reflet, bords */}
            <Group name="finish" listening={false}>
              <Rect width={W} height={D} fillPatternImage={asImg(fabricTexture())} fillPatternScale={{ x: 1 / s, y: 1 / s }}
                globalCompositeOperation="overlay" opacity={0.85} />
              {/* Seconde passe en « screen » : rend le tissage visible même sur un tapis noir */}
              <Rect width={W} height={D} fillPatternImage={asImg(fabricTexture())} fillPatternScale={{ x: 1 / s, y: 1 / s }}
                globalCompositeOperation="screen" opacity={0.11} />
              <Rect width={W} height={D}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: W, y: D }}
                fillLinearGradientColorStops={[0, "rgba(255,255,255,0.16)", 0.35, "rgba(255,255,255,0.02)", 0.7, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.14)"]} />
              <Rect width={W} height={D} cornerRadius={radius} stroke="#000" strokeWidth={0.5} opacity={0.12} />
            </Group>
          </Group>
        </Layer>

        {/* PRINT : éléments qui seront imprimés (zones/texte marqués "imprimés") */}
        <Layer name="print">
          <Group x={ox} y={oy} scaleX={s} scaleY={s} clipFunc={roundedClip(W, D, radius)}>
            {c.product === "playmat" && c.playmat.printZones && zoneNodes}
            {c.product === "playmat" && c.playmat.printText && textNode}
          </Group>
        </Layer>

        {/* VISUAL : aides visuelles uniquement, jamais dans le fichier imprimé/exporté */}
        <Layer name="visual">
          <Group x={ox} y={oy} scaleX={s} scaleY={s}>
            {c.rgb && <RgbStrip w={W} h={D} radius={radius} phase={phase} />}
            {/* Boîtier de contrôle + câble USB qui part vers l'arrière du bureau (sort par le haut de la vue) */}
            {c.rgb && <RgbCable w={W} topY={-oy / s - 2} phase={phase} px={1 / s} />}
            {framing && (
              <>
                <Rect x={printInset} y={printInset} width={W - printInset * 2} height={D - printInset * 2} cornerRadius={Math.max(radius - printInset, 0)}
                  stroke="#12873d" strokeWidth={0.12} dash={[0.7, 0.4]} listening={false} />
                <Text text="Zone d'impression" x={printInset + 0.6} y={printInset + 0.5} fontSize={0.95} fill="#12873d" listening={false} />
              </>
            )}
            {c.product === "playmat" && !c.playmat.printZones && zoneNodes}
            {c.product === "playmat" && !c.playmat.printText && textNode}

            {showZonesTools && c.playmat.showCards && DEMO_CARD_IDS.map((id, i) => {
              const p = c.playmat.cardPos[id] ?? defaultCardPos(c, i);
              return (
                <Group key={id} x={p.x} y={p.y} draggable onDragEnd={(e) => setCardPos(id, { x: r1(e.target.x()), y: r1(e.target.y()) })}>
                  <FictionalCard w={CARD_SIZE.w} h={CARD_SIZE.h} variant={i} />
                </Group>
              );
            })}

            {devices.map((id) => {
              const r = peripheralRect(c, id);
              const out = overflowing(c, r);
              return (
                <Group
                  key={id} x={r.x} y={r.y} draggable
                  onDragMove={(e) => setDevicePos(id, { x: r1(e.target.x()), y: r1(e.target.y()) })}
                  onMouseEnter={(e) => { const st = e.target.getStage(); if (st) st.container().style.cursor = "move"; }}
                  onMouseLeave={(e) => { const st = e.target.getStage(); if (st) st.container().style.cursor = "default"; }}
                >
                  <DeviceShape id={id} w={r.w} h={r.h} keyboard={c.setup.keyboard} />
                  {out && <Rect x={-0.2} y={-0.2} width={r.w + 0.4} height={r.h + 0.4} cornerRadius={1} stroke="#e5484d" strokeWidth={0.22} dash={[0.7, 0.4]} listening={false} />}
                </Group>
              );
            })}

            {/* Indication discrète : petite flèche vers la souris (ou le clavier), jusqu'au premier déplacement */}
            {(() => {
              const target = devices.includes("mouse") ? "mouse" : devices.includes("keyboard") ? "keyboard" : null;
              if (!target || Object.values(c.setup.pos).some(Boolean)) return null;
              const r = peripheralRect(c, target);
              const px = 1 / s; // 1 pixel écran, en cm
              const ex = r.x + r.w + 6 * px, ey = r.y + r.h * 0.3;
              const sx = ex + 44 * px, sy = ey - 26 * px;
              const shadow = { shadowColor: "#000", shadowBlur: 4 * px, shadowOpacity: 0.6, shadowOffsetY: 1 * px };
              return (
                <Group listening={false} opacity={0.85}>
                  <Arrow points={[sx, sy, ex + 22 * px, sy + 2 * px, ex, ey]} tension={0.5}
                    stroke="#fff" fill="#fff" strokeWidth={1.5 * px} pointerLength={6 * px} pointerWidth={6 * px} lineCap="round" {...shadow} />
                  <Text text="glisser pour réajuster" x={sx + 4 * px} y={sy - 7 * px} fontSize={12 * px} fontStyle="500" fill="#fff" {...shadow} />
                </Group>
              );
            })()}
          </Group>
          {/* Éclairage d'ensemble : légère chute de lumière dans les coins, comme sur une photo */}
          <Rect width={size.w} height={size.h} listening={false}
            fillRadialGradientStartPoint={{ x: size.w * 0.45, y: size.h * 0.4 }} fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: size.w * 0.45, y: size.h * 0.4 }} fillRadialGradientEndRadius={Math.max(size.w, size.h) * 0.85}
            fillRadialGradientColorStops={[0, "rgba(0,0,0,0)", 0.65, "rgba(0,0,0,0)", 1, view === "scene" ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.08)"]} />
        </Layer>
      </Stage>
    </div>
  );
}

/**
 * Bande LED RGB intégrée au bord du tapis (comme sur les vrais tapis RGB) :
 * les couleurs défilent LE LONG du contour, avec un cœur lumineux et un halo diffus
 * qui déborde légèrement sur le bureau et sur le tapis. Unités : cm.
 */
function RgbStrip({ w, h, radius, phase }: { w: number; h: number; radius: number; phase: number }) {
  const inset = 0.35; // la LED est dans l'ourlet, pas à l'extérieur du tapis
  const pts = useMemo(() => roundedRectPath(w - inset * 2, h - inset * 2, Math.max(radius - inset, 0), inset), [w, h, radius]);
  return (
    <Shape
      listening={false}
      sceneFunc={(kctx) => {
        const ctx = (kctx as unknown as { _context: CanvasRenderingContext2D })._context;
        const total = pts[pts.length - 1].d;
        ctx.save();
        // Extrémités « butt » : sinon les segments se chevauchent et dessinent des perles le long de la bande
        ctx.lineCap = "butt";
        ctx.globalCompositeOperation = "screen";
        // Du halo le plus large au cœur le plus fin
        const passes: [number, number, number][] = [[3.2, 0.05, 55], [1.8, 0.09, 58], [0.9, 0.22, 60], [0.45, 0.6, 62], [0.18, 0.95, 82]];
        for (const [width, alpha, light] of passes) {
          ctx.lineWidth = width;
          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i];
            const hueDeg = ((a.d / total) * 360 - phase * 2 + 720) % 360;
            ctx.strokeStyle = `hsla(${hueDeg},100%,${light}%,${alpha})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.restore();
      }}
    />
  );
}

/**
 * Boîtier de contrôle LED posé sur le bord arrière (comme sur les vrais tapis RGB)
 * et câble USB qui part vers l'arrière du bureau. Unités : cm. `topY` = haut de la vue.
 */
function RgbCable({ w, topY, phase, px }: { w: number; topY: number; phase: number; px: number }) {
  const bx = Math.min(Math.max(w * 0.12, 6), w / 2); // près du coin arrière gauche
  const bw = 3.4, bh = 1.9;
  const len = Math.max(4, -topY);
  // Léger S : le câble sort droit du boîtier puis dérive, comme posé sur le bureau
  const pts = [bx, -bh / 2 + 0.2, bx, -bh / 2 - 1.5, bx + 1.2, -len * 0.45, bx - 0.8, -len * 0.75, bx + 0.6, topY];
  const shadow = { shadowColor: "#000", shadowBlur: 6 * px, shadowOpacity: 0.45, shadowOffsetY: 2 * px };
  return (
    <Group listening={false}>
      <Line points={pts} tension={0.45} stroke="#141416" strokeWidth={0.42} lineCap="round" {...shadow} />
      <Line points={pts.map((v, i) => (i % 2 === 0 ? v - 0.08 : v))} tension={0.45} stroke="#fff" strokeWidth={0.06} opacity={0.18} lineCap="round" />
      {/* Boîtier à cheval sur le bord du tapis */}
      <Rect x={bx - bw / 2} y={-bh / 2 - 0.2} width={bw} height={bh} cornerRadius={0.55} fill="#1b1c1f" stroke="#2c2d31" strokeWidth={0.06} {...shadow} />
      <Rect x={bx - bw / 2 + 0.08} y={-bh / 2 - 0.12} width={bw - 0.16} height={0.5} cornerRadius={0.4} fill="#fff" opacity={0.07} />
      {/* Bouton de mode + témoin lumineux */}
      <Circle x={bx - 0.6} y={-0.2 + 0.1} radius={0.42} fill="#26272b" stroke="#3a3b40" strokeWidth={0.05} />
      <Circle x={bx + 0.85} y={-0.1} radius={0.16} fill={`hsl(${(360 - phase * 2 + 720) % 360},100%,60%)`}
        shadowColor={`hsl(${(360 - phase * 2 + 720) % 360},100%,60%)`} shadowBlur={8 * px} shadowOpacity={0.9} />
    </Group>
  );
}

/** Points d'un rectangle arrondi (décalé de `o`), avec la distance parcourue `d` pour colorer le long du contour. */
function roundedRectPath(w: number, h: number, r: number, o: number) {
  const raw: { x: number; y: number }[] = [];
  const seg = (x0: number, y0: number, x1: number, y1: number, n: number) => {
    for (let i = 0; i < n; i++) raw.push({ x: x0 + ((x1 - x0) * i) / n, y: y0 + ((y1 - y0) * i) / n });
  };
  const arc = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i < 6; i++) { const a = a0 + (Math.PI / 2) * (i / 6); raw.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); }
  };
  const nW = Math.max(8, Math.round(w)), nH = Math.max(6, Math.round(h));
  seg(r, 0, w - r, 0, nW); if (r) arc(w - r, r, -Math.PI / 2);
  seg(w, r, w, h - r, nH); if (r) arc(w - r, h - r, 0);
  seg(w - r, h, r, h, nW); if (r) arc(r, h - r, Math.PI / 2);
  seg(0, h - r, 0, r, nH); if (r) arc(r, r, Math.PI);
  raw.push({ ...raw[0] });
  let d = 0;
  return raw.map((p, i) => {
    if (i) d += Math.hypot(p.x - raw[i - 1].x, p.y - raw[i - 1].y);
    return { x: p.x + o, y: p.y + o, d };
  });
}
