import {
  CARD_CANVAS_H,
  CARD_CANVAS_W,
  CardDef,
} from '@/scene/cards/card-configs';
import { cardBackgroundGradients, catppuccin } from '@/tokens/theme';
import * as THREE from 'three';
import {
  drawConstellationDots,
  drawLeafArc,
  drawMoonPhases,
  drawMushroom,
  drawOrnamentalCorner,
  drawOuterRing,
  drawPentagram,
  drawScatteredStars,
  drawVineBorder,
} from './drawing-utils';

type IllustrationDrawer = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  card: CardDef,
) => void;

function drawAboutIllustration(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  card: CardDef,
) {
  drawOuterRing(ctx, cx, cy, card.accentColor, 132, 118);
  drawConstellationDots(
    ctx,
    cx,
    cy,
    card.accentColor,
    142,
    10,
    0.2,
    0.1,
    4,
    2.5,
  );
  ctx.save();
  ctx.shadowColor = card.accentColor;
  ctx.shadowBlur = 55;
  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.arc(cx, cy, 82, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = catppuccin.crust;
  ctx.beginPath();
  ctx.arc(cx, cy, 82, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 82, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 0.88;
  ctx.beginPath();
  ctx.arc(cx, cy, 82, 0, Math.PI * 2);
  ctx.moveTo(cx + 36 + 82, cy - 16);
  ctx.arc(cx + 36, cy - 16, 82, 0, Math.PI * 2);
  ctx.fill('evenodd');
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = `${card.accentColor}60`;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy - 8);
  ctx.bezierCurveTo(cx - 24, cy - 12, cx - 18, cy - 12, cx - 12, cy - 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - 22, cy + 8, 10, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.restore();
  const cStars = [
    { x: cx - 88, y: cy - 98 },
    { x: cx - 48, y: cy - 66 },
    { x: cx + 2, y: cy - 100 },
    { x: cx + 50, y: cy - 62 },
    { x: cx + 90, y: cy - 90 },
    { x: cx - 35, y: cy + 108 },
    { x: cx + 45, y: cy + 96 },
  ];
  const cEdges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
  ];
  ctx.strokeStyle = `${card.accentColor}25`;
  ctx.lineWidth = 0.7;
  cEdges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(cStars[a].x, cStars[a].y);
    ctx.lineTo(cStars[b].x, cStars[b].y);
    ctx.stroke();
  });
  cStars.forEach((s) => {
    ctx.save();
    ctx.shadowColor = catppuccin.text;
    ctx.shadowBlur = 10;
    ctx.fillStyle = catppuccin.text;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.save();
  ctx.globalAlpha = 0.88;
  drawMushroom(ctx, cx, cy + 148, 40, catppuccin.pink);
  drawMushroom(ctx, cx - 52, cy + 160, 28, catppuccin.maroon);
  drawMushroom(ctx, cx + 50, cy + 162, 26, catppuccin.flamingo);
  drawMushroom(ctx, cx - 26, cy + 170, 18, catppuccin.rosewater);
  drawMushroom(ctx, cx + 28, cy + 156, 20, catppuccin.maroon);
  ctx.restore();
  drawLeafArc(ctx, cx, cy, 136, -2.85, -2.15, card.accentColor, 7, 11);
  drawLeafArc(ctx, cx, cy, 136, -0.85, -0.15, card.accentColor, 7, 11);
  drawLeafArc(ctx, cx, cy, 136, 2.35, 3.0, card.accentColor, 6, 11);
  drawLeafArc(ctx, cx, cy, 136, 0.15, 0.8, card.accentColor, 6, 11);
}

function drawFormationsIllustration(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  card: CardDef,
) {
  drawOuterRing(ctx, cx, cy, card.accentColor, 135, 120);
  drawConstellationDots(
    ctx,
    cx,
    cy,
    card.accentColor,
    128,
    14,
    0.14,
    0.07,
    3,
    2,
  );

  const hgHalfH = 86,
    hgHalfW = 56,
    hgWaist = 9;
  const hgTop = cy - hgHalfH,
    hgBot = cy + hgHalfH;
  const pathHourglass = () => {
    ctx.beginPath();
    ctx.moveTo(cx - hgHalfW, hgTop);
    ctx.lineTo(cx + hgHalfW, hgTop);
    ctx.bezierCurveTo(
      cx + hgHalfW,
      hgTop + 28,
      cx + hgWaist,
      cy - 12,
      cx + hgWaist,
      cy,
    );
    ctx.bezierCurveTo(
      cx + hgWaist,
      cy + 12,
      cx + hgHalfW,
      hgBot - 28,
      cx + hgHalfW,
      hgBot,
    );
    ctx.lineTo(cx - hgHalfW, hgBot);
    ctx.bezierCurveTo(
      cx - hgHalfW,
      hgBot - 28,
      cx - hgWaist,
      cy + 12,
      cx - hgWaist,
      cy,
    );
    ctx.bezierCurveTo(
      cx - hgWaist,
      cy - 12,
      cx - hgHalfW,
      hgTop + 28,
      cx - hgHalfW,
      hgTop,
    );
    ctx.closePath();
  };

  ctx.save();
  pathHourglass();
  ctx.fillStyle = 'rgba(17, 17, 27, 0.9)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = card.accentColor;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.92;
  pathHourglass();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 0.88;
  ctx.fillRect(cx - hgHalfW - 3, hgTop - 10, hgHalfW * 2 + 6, 10);
  ctx.fillRect(cx - hgHalfW - 3, hgBot, hgHalfW * 2 + 6, 10);
  ctx.globalAlpha = 1;

  for (let i = 0; i < 32; i++) {
    const px =
      cx + Math.sin(i * 2.39) * (hgHalfW * 0.72 * (1 - (i / 32) * 0.45));
    const py = hgTop + 18 + (i / 32) * (hgHalfH - 26);
    ctx.fillStyle = card.accentColor;
    ctx.globalAlpha = 0.35 + Math.sin(i * 3.1) * 0.25;
    ctx.beginPath();
    ctx.arc(px, py, 0.9 + Math.cos(i * 1.7) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = catppuccin.yellow;
    ctx.globalAlpha = 0.7 - i * 0.15;
    ctx.beginPath();
    ctx.arc(
      cx + (i % 2 === 0 ? 1.5 : -1.5),
      cy - 8 + i * 5,
      1.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  for (let i = 0; i < 16; i++) {
    const spread = hgHalfW * (0.38 + (i / 16) * 0.32);
    const px = cx + Math.sin(i * 1.87) * spread;
    const py = hgBot - 16 - (i / 16) * (hgHalfH * 0.55);
    ctx.fillStyle = card.accentColor;
    ctx.globalAlpha = 0.55 + Math.sin(i * 2.8) * 0.2;
    ctx.beginPath();
    ctx.arc(px, py, 0.9 + Math.cos(i * 2.1) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.shadowColor = card.accentColor;
  ctx.shadowBlur = 22;
  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const cStars = [
    { x: cx - 100, y: cy - 78 },
    { x: cx - 68, y: cy - 100 },
    { x: cx - 20, y: cy - 112 },
    { x: cx + 28, y: cy - 108 },
    { x: cx + 72, y: cy - 96 },
    { x: cx + 102, y: cy - 72 },
    { x: cx - 85, y: cy + 60 },
    { x: cx - 85, y: cy + 108 },
    { x: cx - 110, y: cy + 84 },
    { x: cx - 60, y: cy + 84 },
  ];
  const cEdges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [6, 7],
    [8, 9],
  ];
  ctx.strokeStyle = `${card.accentColor}28`;
  ctx.lineWidth = 0.7;
  cEdges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(cStars[a].x, cStars[a].y);
    ctx.lineTo(cStars[b].x, cStars[b].y);
    ctx.stroke();
  });
  cStars.forEach((s) => {
    ctx.save();
    ctx.shadowColor = catppuccin.text;
    ctx.shadowBlur = 8;
    ctx.fillStyle = catppuccin.text;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  [
    { x: cx + 52, y: cy - 118 },
    { x: cx - 48, y: cy - 110 },
    { x: cx + 90, y: cy - 58 },
    { x: cx - 86, y: cy - 46 },
    { x: cx + 94, y: cy + 56 },
    { x: cx + 62, y: cy + 106 },
  ].forEach((s, i) => {
    ctx.fillStyle = card.accentColor;
    ctx.globalAlpha = 0.65 + (i % 3) * 0.1;
    ctx.font = `${8 + (i % 3) * 3}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i % 2 ? '✧' : '✦', s.x, s.y);
    ctx.globalAlpha = 1;
  });

  drawLeafArc(ctx, cx, cy, 139, -2.95, -2.45, card.accentColor, 5, 10);
  drawLeafArc(ctx, cx, cy, 139, -0.55, -0.05, card.accentColor, 5, 10);
  drawLeafArc(ctx, cx, cy, 139, 2.4, 2.95, card.accentColor, 5, 10);
  drawLeafArc(ctx, cx, cy, 139, 0.15, 0.7, card.accentColor, 5, 10);
}

function drawContactIllustration(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  card: CardDef,
) {
  drawOuterRing(ctx, cx, cy, card.accentColor, 132);

  drawLeafArc(ctx, cx, cy, 136, 1.15, 1.95, card.accentColor, 7, 11);

  ctx.save();
  ctx.shadowColor = card.accentColor;
  ctx.shadowBlur = 40;
  ctx.fillStyle = catppuccin.crust;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `${card.accentColor}55`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 68, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawPentagram(ctx, cx, cy, 55, card.accentColor);

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 9) {
    const ix = cx + Math.cos(a) * 42,
      iy = cy + Math.sin(a) * 42;
    const ox = cx + Math.cos(a) * 64,
      oy = cy + Math.sin(a) * 64;
    ctx.strokeStyle = card.accentColor;
    ctx.lineWidth = 0.7;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ox, oy);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.strokeStyle = card.accentColor;
  ctx.fillStyle = card.accentColor;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.55;
  ctx.save();
  ctx.translate(cx - 110, cy - 90);
  ctx.rotate(0.6);
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.bezierCurveTo(12, -28, 14, -10, 8, 0);
  ctx.bezierCurveTo(4, 8, -4, 8, -8, 0);
  ctx.bezierCurveTo(-14, -10, -12, -28, 0, -38);
  ctx.fill();
  ctx.fillStyle = catppuccin.surface0;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(0, 8);
  ctx.bezierCurveTo(-6, 2, -10, -6, -8, 0);
  ctx.fill();
  ctx.fillStyle = catppuccin.surface1;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-3, 22);
  ctx.lineTo(0, 20);
  ctx.lineTo(3, 22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 0.55;
  ctx.save();
  ctx.translate(cx + 110, cy - 90);
  ctx.rotate(-0.6);
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.bezierCurveTo(-12, -28, -14, -10, -8, 0);
  ctx.bezierCurveTo(-4, 8, 4, 8, 8, 0);
  ctx.bezierCurveTo(14, -10, 12, -28, 0, -38);
  ctx.fill();
  ctx.fillStyle = catppuccin.surface0;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(0, 8);
  ctx.bezierCurveTo(6, 2, 10, -6, 8, 0);
  ctx.fill();
  ctx.fillStyle = catppuccin.surface1;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(3, 22);
  ctx.lineTo(0, 20);
  ctx.lineTo(-3, 22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawExperiencesIllustration(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  card: CardDef,
) {
  drawOuterRing(ctx, cx, cy, card.accentColor, 132, 118);
  drawConstellationDots(
    ctx,
    cx,
    cy,
    card.accentColor,
    126,
    12,
    0.15,
    0.08,
    4,
    2,
  );

  ctx.fillStyle = 'rgba(17, 17, 27, 0.85)';
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `${card.accentColor}70`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.stroke();
  [(-Math.PI * 3) / 4, -Math.PI / 4, Math.PI / 4, (Math.PI * 3) / 4].forEach(
    (angle) => {
      ctx.strokeStyle = `${card.accentColor}55`;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 50, cy + Math.sin(angle) * 50);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  );
  [
    [-Math.PI / 2, 72],
    [Math.PI / 2, 72],
    [0, 66],
    [Math.PI, 66],
  ].forEach(([angle, len]) => {
    ctx.save();
    ctx.shadowColor = card.accentColor;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = card.accentColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
    ctx.restore();
  });

  const drawDiamond = (dx: number, dy: number, size: number) => {
    ctx.save();
    ctx.shadowColor = card.accentColor;
    ctx.shadowBlur = 16;
    ctx.fillStyle = card.accentColor;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(dx, dy - size);
    ctx.lineTo(dx + size * 0.38, dy);
    ctx.lineTo(dx, dy + size * 0.6);
    ctx.lineTo(dx - size * 0.38, dy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  drawDiamond(cx, cy - 72, 14);
  drawDiamond(cx, cy + 72, 14);
  drawDiamond(cx + 66, cy, 12);
  drawDiamond(cx - 66, cy, 12);

  ctx.save();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 22;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const cStars = [
    { x: cx + 72, y: cy - 110 },
    { x: cx + 86, y: cy - 58 },
    { x: cx + 96, y: cy - 2 },
    { x: cx + 116, y: cy - 72 },
    { x: cx + 38, y: cy - 82 },
    { x: cx - 68, y: cy - 96 },
    { x: cx - 106, y: cy + 28 },
    { x: cx - 52, y: cy + 114 },
  ];
  const cEdges: [number, number][] = [
    [0, 1],
    [1, 2],
    [3, 1],
    [1, 4],
  ];
  ctx.strokeStyle = `${card.accentColor}28`;
  ctx.lineWidth = 0.7;
  cEdges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(cStars[a].x, cStars[a].y);
    ctx.lineTo(cStars[b].x, cStars[b].y);
    ctx.stroke();
  });
  cStars.forEach((s) => {
    ctx.save();
    ctx.shadowColor = catppuccin.text;
    ctx.shadowBlur = 8;
    ctx.fillStyle = catppuccin.text;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  [
    { x: cx + 50, y: cy - 118 },
    { x: cx - 46, y: cy - 112 },
    { x: cx + 90, y: cy - 38 },
    { x: cx - 86, y: cy - 48 },
    { x: cx + 94, y: cy + 58 },
    { x: cx - 90, y: cy + 72 },
  ].forEach((s, i) => {
    ctx.fillStyle = card.accentColor;
    ctx.globalAlpha = 0.65 + (i % 3) * 0.1;
    ctx.font = `${8 + (i % 3) * 3}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i % 2 ? '✧' : '✦', s.x, s.y);
    ctx.globalAlpha = 1;
  });

  drawLeafArc(ctx, cx, cy, 136, -2.85, -2.15, card.accentColor, 6, 10);
  drawLeafArc(ctx, cx, cy, 136, -0.85, -0.15, card.accentColor, 6, 10);
  drawLeafArc(ctx, cx, cy, 136, 2.35, 2.95, card.accentColor, 6, 10);
  drawLeafArc(ctx, cx, cy, 136, 0.15, 0.75, card.accentColor, 6, 10);
}

function drawProjectsIllustration(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  card: CardDef,
) {
  drawOuterRing(ctx, cx, cy, card.accentColor, 132, 118);
  drawConstellationDots(
    ctx,
    cx,
    cy,
    card.accentColor,
    126,
    12,
    0.15,
    0.08,
    4,
    2,
  );

  const cauldronY = cy + 28;
  ctx.save();
  ctx.shadowColor = card.accentColor;
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'rgba(17, 17, 27, 0.92)';
  ctx.beginPath();
  ctx.moveTo(cx - 52, cauldronY - 38);
  ctx.bezierCurveTo(
    cx - 58,
    cauldronY - 38,
    cx - 62,
    cauldronY - 30,
    cx - 62,
    cauldronY - 18,
  );
  ctx.bezierCurveTo(
    cx - 62,
    cauldronY + 18,
    cx - 48,
    cauldronY + 42,
    cx,
    cauldronY + 48,
  );
  ctx.bezierCurveTo(
    cx + 48,
    cauldronY + 42,
    cx + 62,
    cauldronY + 18,
    cx + 62,
    cauldronY - 18,
  );
  ctx.bezierCurveTo(
    cx + 62,
    cauldronY - 30,
    cx + 58,
    cauldronY - 38,
    cx + 52,
    cauldronY - 38,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.9;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.ellipse(cx, cauldronY - 38, 56, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(17, 17, 27, 0.95)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.75;
  [-28, 0, 28].forEach((dx) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx, cauldronY + 42);
    ctx.lineTo(cx + dx + (dx < 0 ? -6 : dx > 0 ? 6 : 0), cauldronY + 58);
    ctx.stroke();
  });
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 56, cauldronY - 28);
  ctx.bezierCurveTo(
    cx - 78,
    cauldronY - 32,
    cx - 78,
    cauldronY - 6,
    cx - 60,
    cauldronY - 4,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 56, cauldronY - 28);
  ctx.bezierCurveTo(
    cx + 78,
    cauldronY - 32,
    cx + 78,
    cauldronY - 6,
    cx + 60,
    cauldronY - 4,
  );
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = card.accentColor;
  ctx.shadowBlur = 30;
  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.ellipse(cx, cauldronY - 34, 48, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const wisps = [
    { dx: -18, startY: -48, amp: 12, h: 72, alpha: 0.4 },
    { dx: 6, startY: -50, amp: -10, h: 82, alpha: 0.5 },
    { dx: 22, startY: -46, amp: 14, h: 68, alpha: 0.35 },
    { dx: -8, startY: -52, amp: -8, h: 90, alpha: 0.45 },
  ];
  wisps.forEach((w) => {
    ctx.save();
    ctx.strokeStyle = card.accentColor;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = w.alpha;
    ctx.beginPath();
    const sx = cx + w.dx;
    const sy = cauldronY + w.startY;
    ctx.moveTo(sx, sy);
    for (let t = 0; t <= 1; t += 0.05) {
      const x = sx + Math.sin(t * Math.PI * 2.5) * w.amp * t;
      const y = sy - t * w.h;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  });

  const symbols = [
    { s: '✦', x: cx - 28, y: cy - 56, sz: 14, a: 0.7 },
    { s: '◇', x: cx + 22, y: cy - 68, sz: 12, a: 0.55 },
    { s: '○', x: cx - 6, y: cy - 86, sz: 11, a: 0.6 },
    { s: '✧', x: cx + 36, y: cy - 42, sz: 10, a: 0.45 },
    { s: '△', x: cx - 38, y: cy - 38, sz: 10, a: 0.4 },
    { s: '⬡', x: cx, y: cy - 108, sz: 16, a: 0.65 },
  ];
  symbols.forEach((sym) => {
    ctx.save();
    ctx.shadowColor = card.accentColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = card.accentColor;
    ctx.globalAlpha = sym.a;
    ctx.font = `${sym.sz}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sym.s, sym.x, sym.y);
    ctx.restore();
  });

  [
    { dx: -18, dy: -32, r: 3 },
    { dx: 12, dy: -28, r: 2.5 },
    { dx: -6, dy: -35, r: 4 },
    { dx: 24, dy: -33, r: 2 },
    { dx: -30, dy: -30, r: 2 },
  ].forEach((b) => {
    ctx.save();
    ctx.strokeStyle = card.accentColor;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(cx + b.dx, cauldronY + b.dy, b.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = card.accentColor;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.restore();
  });

  const cStars = [
    { x: cx - 68, y: cy - 94 },
    { x: cx - 95, y: cy - 55 },
    { x: cx - 75, y: cy - 18 },
    { x: cx + 75, y: cy - 16 },
    { x: cx + 95, y: cy - 52 },
    { x: cx + 70, y: cy - 92 },
    { x: cx - 54, y: cy + 112 },
    { x: cx + 60, y: cy + 108 },
  ];
  const cEdges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
  ];
  ctx.strokeStyle = `${card.accentColor}28`;
  ctx.lineWidth = 0.7;
  cEdges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(cStars[a].x, cStars[a].y);
    ctx.lineTo(cStars[b].x, cStars[b].y);
    ctx.stroke();
  });
  cStars.forEach((s) => {
    ctx.save();
    ctx.shadowColor = catppuccin.text;
    ctx.shadowBlur = 8;
    ctx.fillStyle = catppuccin.text;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  drawLeafArc(ctx, cx, cy, 136, 2.35, 2.95, card.accentColor, 6, 10);
  drawLeafArc(ctx, cx, cy, 136, 0.15, 0.75, card.accentColor, 6, 10);

  ctx.save();
  ctx.globalAlpha = 0.85;
  drawMushroom(ctx, cx - 105, cy + 148, 22, catppuccin.pink);
  drawMushroom(ctx, cx - 88, cy + 142, 16, catppuccin.maroon);
  drawMushroom(ctx, cx + 105, cy + 148, 22, catppuccin.pink);
  drawMushroom(ctx, cx + 88, cy + 142, 16, catppuccin.maroon);
  ctx.restore();
}

const ILLUSTRATION_DRAWERS: Record<string, IllustrationDrawer> = {
  about: drawAboutIllustration,
  formations: drawFormationsIllustration,
  contact: drawContactIllustration,
  experiences: drawExperiencesIllustration,
  projects: drawProjectsIllustration,
};

function drawCardIllustration(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  card: CardDef,
) {
  const cx = W / 2;
  const cy = H * 0.375;
  ILLUSTRATION_DRAWERS[card.id]?.(ctx, cx, cy, card);
}

export function createFrontTexture(card: CardDef): THREE.CanvasTexture {
  const W = CARD_CANVAS_W;
  const H = CARD_CANVAS_H;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  const stops =
    cardBackgroundGradients[card.id] ?? cardBackgroundGradients.projects;
  bg.addColorStop(0, stops[0]);
  bg.addColorStop(0.55, stops[1]);
  bg.addColorStop(1, stops[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const sg = ctx.createLinearGradient(0, 0, W, 0);
  sg.addColorStop(0, `${card.accentColor}22`);
  sg.addColorStop(0.5, 'transparent');
  sg.addColorStop(1, `${card.accentColor}22`);
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, H);

  drawScatteredStars(ctx, W, H, card.accentColor, 90, 55);

  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, W - 84, H - 84);
  ctx.strokeStyle = `${card.accentColor}33`;
  ctx.lineWidth = 1;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  drawVineBorder(ctx, W, H, 32, card.accentColor);

  drawOrnamentalCorner(ctx, 52, 52, 1, 1, card.accentColor);
  drawOrnamentalCorner(ctx, W - 52, 52, -1, 1, card.accentColor);
  drawOrnamentalCorner(ctx, W - 52, H - 52, -1, -1, card.accentColor);
  drawOrnamentalCorner(ctx, 52, H - 52, 1, -1, card.accentColor);

  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 1.0;
  ctx.font = '700 17px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.roman, W / 2, 56);
  ctx.globalAlpha = 1;

  drawMoonPhases(ctx, W / 2, 78, card.accentColor, 6);

  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(60, 102);
  ctx.lineTo(W / 2 - 22, 102);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2 + 22, 102);
  ctx.lineTo(W - 60, 102);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = card.accentColor;
  ctx.font = '14px serif';
  ctx.textAlign = 'center';
  ctx.fillText('◆', W / 2, 102);

  drawCardIllustration(ctx, W, H, card);

  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.88;
  ctx.beginPath();
  ctx.moveTo(60, H * 0.635);
  ctx.lineTo(W - 60, H * 0.635);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = card.accentColor;
  ctx.font = '15px serif';
  ctx.textAlign = 'center';
  ctx.fillText('· ✦ ·', W / 2, H * 0.635);

  ctx.save();
  ctx.fillStyle = 'rgba(17, 17, 27, 0.82)';
  ctx.fillRect(62, H * 0.64, W - 124, H * 0.185);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = catppuccin.text;
  ctx.font = '700 50px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.label.toUpperCase(), W / 2, H * 0.726);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 0.9;
  ctx.textBaseline = 'middle';
  const subY = H * 0.776;
  const subParts = card.subtitle.match(/^(\S+)\s+(.+)\s+(\S+)$/);
  if (subParts) {
    const [, left, mid, right] = subParts;
    ctx.font = '18px Georgia, serif';
    ctx.textAlign = 'center';
    const midW = ctx.measureText(mid).width;
    const gap = 10;
    ctx.textAlign = 'right';
    ctx.fillText(left, W / 2 - midW / 2 - gap, subY);
    ctx.font = 'italic 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(mid, W / 2, subY);
    ctx.font = '18px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(right, W / 2 + midW / 2 + gap, subY);
  } else {
    ctx.font = 'italic 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(card.subtitle, W / 2, subY);
  }
  ctx.restore();

  ctx.strokeStyle = card.accentColor;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(60, H * 0.825);
  ctx.lineTo(W - 60, H * 0.825);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = card.accentColor;
  ctx.globalAlpha = 1.0;
  ctx.font = '22px serif';
  ctx.textAlign = 'center';
  ctx.fillText('· · ·', W / 2, H - 54);
  ctx.font = '14px serif';
  ctx.fillText('✧', 60, 58);
  ctx.fillText('✧', W - 60, 58);
  ctx.fillText('✧', 60, H - 54);
  ctx.fillText('✧', W - 60, H - 54);
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
