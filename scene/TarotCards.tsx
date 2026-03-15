import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { Mesh, Group, PointLight } from 'three'
import { useLanguage } from '../app/LanguageContext'

interface CardDef {
  id: string
  symbol: string
  label: string
  accentColor: string
  position: [number, number, number]
}

type SlotDef = { position: [number, number, number] }

// 4 cards in a row (landscape / desktop)
const LANDSCAPE_SLOTS: SlotDef[] = [
  { position: [-3.2, 0, 0] },
  { position: [-1.07, 0, 0] },
  { position: [1.07, 0, 0] },
  { position: [3.2, 0, 0] },
]

// 2×2 grid (portrait mobile / tablet)
const PORTRAIT_SLOTS: SlotDef[] = [
  { position: [-1.1, 1.8, 0] },
  { position: [1.1, 1.8, 0] },
  { position: [-1.1, -1.8, 0] },
  { position: [1.1, -1.8, 0] },
]

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function drawLeafShape(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(-size * 0.38, -size * 0.28, -size * 0.32, -size * 0.78, 0, -size)
  ctx.bezierCurveTo(size * 0.32, -size * 0.78, size * 0.38, -size * 0.28, 0, 0)
  ctx.fill()
}

function drawHVine(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, color: string, inward: number) {
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.82
  ctx.beginPath(); ctx.moveTo(x1, y)
  const steps = Math.ceil((x2 - x1) / 10)
  for (let i = 0; i <= steps; i++) {
    const x = x1 + (x2 - x1) * i / steps
    ctx.lineTo(x, y + Math.sin(i * 0.85) * 2.8)
  }
  ctx.stroke()
  for (let x = x1 + 7; x < x2 - 7; x += 20) {
    const wave = Math.sin((x - x1) * 0.047) * 2.8
    const side = Math.floor((x - x1) / 20) % 2 === 0 ? inward : -inward
    ctx.save(); ctx.translate(x, y + wave); ctx.rotate(side * 0.7)
    drawLeafShape(ctx, 11); ctx.restore()
    if (Math.floor((x - x1) / 20) % 3 === 0) {
      ctx.beginPath(); ctx.arc(x + side * 7, y + wave - 3, 2.8, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.restore()
}

function drawVVine(ctx: CanvasRenderingContext2D, x: number, y1: number, y2: number, color: string, inward: number) {
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.82
  ctx.beginPath(); ctx.moveTo(x, y1)
  const steps = Math.ceil((y2 - y1) / 10)
  for (let i = 0; i <= steps; i++) {
    const y = y1 + (y2 - y1) * i / steps
    ctx.lineTo(x + Math.sin(i * 0.85) * 2.8, y)
  }
  ctx.stroke()
  for (let y = y1 + 7; y < y2 - 7; y += 20) {
    const wave = Math.sin((y - y1) * 0.047) * 2.8
    const side = Math.floor((y - y1) / 20) % 2 === 0 ? inward : -inward
    ctx.save(); ctx.translate(x + wave, y); ctx.rotate(side * 0.7 + Math.PI / 2)
    drawLeafShape(ctx, 11); ctx.restore()
    if (Math.floor((y - y1) / 20) % 3 === 0) {
      ctx.beginPath(); ctx.arc(x + wave - 3, y + side * 7, 2.8, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.restore()
}

function drawVineBorder(ctx: CanvasRenderingContext2D, W: number, H: number, margin: number, color: string) {
  drawHVine(ctx, margin, W - margin, margin, color, 1)
  drawHVine(ctx, margin, W - margin, H - margin, color, -1)
  drawVVine(ctx, margin, margin, H - margin, color, 1)
  drawVVine(ctx, W - margin, margin, H - margin, color, -1)
}

function drawMushroom(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, capColor: string) {
  ctx.save()
  ctx.fillStyle = '#c8b090'; ctx.globalAlpha = 0.85
  ctx.beginPath()
  ctx.moveTo(x - sz * 0.22, y)
  ctx.lineTo(x - sz * 0.18, y - sz * 0.42)
  ctx.lineTo(x + sz * 0.18, y - sz * 0.42)
  ctx.lineTo(x + sz * 0.22, y); ctx.fill()
  ctx.fillStyle = capColor; ctx.globalAlpha = 0.95
  ctx.beginPath(); ctx.arc(x, y - sz * 0.42, sz * 0.48, Math.PI, 0); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.globalAlpha = 0.5
  ctx.beginPath(); ctx.arc(x - sz * 0.14, y - sz * 0.54, sz * 0.07, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x + sz * 0.13, y - sz * 0.49, sz * 0.05, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x, y - sz * 0.66, sz * 0.06, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawCrystalCluster(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, sz = 1) {
  ctx.save()
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.88
  const shards = [
    { dx: 0, h: 34 * sz, w: 8 * sz, a: 0 },
    { dx: -11 * sz, h: 25 * sz, w: 6 * sz, a: -0.22 },
    { dx: 11 * sz, h: 28 * sz, w: 6 * sz, a: 0.18 },
    { dx: -19 * sz, h: 18 * sz, w: 5 * sz, a: -0.38 },
    { dx: 20 * sz, h: 20 * sz, w: 5 * sz, a: 0.32 },
    { dx: -6 * sz, h: 15 * sz, w: 4 * sz, a: -0.1 },
  ]
  shards.forEach(s => {
    ctx.save(); ctx.translate(x + s.dx, y); ctx.rotate(s.a)
    ctx.beginPath(); ctx.moveTo(0, -s.h); ctx.lineTo(-s.w, 0); ctx.lineTo(0, s.h * 0.18); ctx.lineTo(s.w, 0); ctx.closePath()
    ctx.fill(); ctx.stroke(); ctx.restore()
  })
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.globalAlpha = 0.4
  ctx.beginPath(); ctx.arc(x - 3 * sz, y - 28 * sz, 3 * sz, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}


function drawSpiderWeb(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.68
  const spokes = 8
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2
    ctx.beginPath(); ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke()
  }
  for (let ring = 1; ring <= 6; ring++) {
    const rr = r * ring / 6
    ctx.beginPath()
    for (let i = 0; i <= spokes; i++) {
      const a = (i / spokes) * Math.PI * 2
      i === 0 ? ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
              : ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
    }
    ctx.stroke()
  }
  // Spider
  ctx.fillStyle = color; ctx.globalAlpha = 0.82
  ctx.beginPath(); ctx.arc(cx + r * 0.42, cy + r * 0.28, r * 0.065, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawPentagram(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.78
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.globalAlpha = 0.68
  const pts = Array.from({ length: 5 }, (_, i) => ({
    x: cx + Math.cos((i * 4 * Math.PI) / 5 - Math.PI / 2) * r * 0.82,
    y: cy + Math.sin((i * 4 * Math.PI) / 5 - Math.PI / 2) * r * 0.82,
  }))
  ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath(); ctx.stroke()
  ctx.restore()
}

function drawScatteredStars(ctx: CanvasRenderingContext2D, W: number, H: number, color: string, count = 80, margin = 50) {
  for (let i = 0; i < count; i++) {
    const x = margin + ((Math.sin(i * 2.39) * 0.5 + 0.5)) * (W - margin * 2)
    const y = margin + ((Math.cos(i * 1.73) * 0.5 + 0.5)) * (H - margin * 2)
    const alpha = 0.22 + (Math.sin(i * 3.14) * 0.5 + 0.5) * 0.42
    const size = 0.8 + (Math.cos(i * 2.71) * 0.5 + 0.5) * 1.8
    ctx.fillStyle = color; ctx.globalAlpha = alpha
    ctx.beginPath(); ctx.arc(x, y, size * 0.35, 0, Math.PI * 2); ctx.fill()
    if (i % 7 === 0) {
      ctx.font = `${size * 5}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('✦', x, y)
    }
  }
  ctx.globalAlpha = 1
}

function drawMoonPhases(ctx: CanvasRenderingContext2D, cx: number, y: number, color: string, r = 8) {
  const bg = '#0c0a14'
  const phases = [
    (x: number) => { ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.72; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke() },
    (x: number) => { ctx.fillStyle = color; ctx.globalAlpha = 0.82; ctx.beginPath(); ctx.arc(x, y, r, Math.PI / 2, Math.PI * 1.5); ctx.fill(); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x + r * 0.4, y, r * 0.88, 0, Math.PI * 2); ctx.fill() },
    (x: number) => { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.fillStyle = color; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore() },
    (x: number) => { ctx.fillStyle = color; ctx.globalAlpha = 0.82; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2); ctx.fill(); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x - r * 0.4, y, r * 0.88, 0, Math.PI * 2); ctx.fill() },
    (x: number) => { ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.72; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke() },
  ]
  const sp = r * 3.5
  const startX = cx - (phases.length - 1) * sp / 2
  phases.forEach((draw, i) => { ctx.save(); draw(startX + i * sp); ctx.restore() })
}

function drawSprig(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle)
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1 * scale
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -44 * scale); ctx.stroke()
  const leaves = [{ y: -10, a: -0.55, s: 9 }, { y: -19, a: 0.55, s: 10 }, { y: -28, a: -0.5, s: 9 }, { y: -37, a: 0.5, s: 8 }, { y: -42, a: -0.2, s: 6 }]
  leaves.forEach(l => {
    ;[-1, 1].forEach(side => {
      ctx.save(); ctx.translate(0, l.y * scale); ctx.rotate(l.a * side)
      drawLeafShape(ctx, l.s * scale); ctx.restore()
    })
  })
  ctx.restore()
}

function drawOrnamentalCorner(ctx: CanvasRenderingContext2D, x: number, y: number, sx: number, sy: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy)
  ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.88
  ctx.beginPath(); ctx.moveTo(0, 22); ctx.quadraticCurveTo(0, 0, 22, 0); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, 38); ctx.quadraticCurveTo(0, 0, 38, 0); ctx.stroke()
  ctx.fillStyle = color; ctx.globalAlpha = 1.0
  ctx.font = '15px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('✦', 8, 8); ctx.restore()
}

// ─── Back texture ─────────────────────────────────────────────────────────────

function createBackTexture(): THREE.CanvasTexture {
  const W = 512, H = 896
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  const bg = ctx.createRadialGradient(W / 2, H * 0.42, 55, W / 2, H / 2, 460)
  bg.addColorStop(0, '#1e1430'); bg.addColorStop(0.4, '#130f20')
  bg.addColorStop(0.8, '#0a0810'); bg.addColorStop(1, '#06050a')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Crosshatch
  ctx.save(); ctx.strokeStyle = 'rgba(107,77,122,0.07)'; ctx.lineWidth = 0.8
  for (let i = -H; i < W + H; i += 30) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(i + H, 0); ctx.lineTo(i, H); ctx.stroke()
  }
  ctx.restore()

  drawScatteredStars(ctx, W, H, '#d4a574', 120, 45)

  // Borders
  ctx.strokeStyle = '#6b4d7a'; ctx.lineWidth = 5; ctx.strokeRect(10, 10, W - 20, H - 20)
  ctx.strokeStyle = '#d4a574'; ctx.lineWidth = 2; ctx.strokeRect(42, 42, W - 84, H - 84)
  ctx.strokeStyle = 'rgba(107,77,122,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(52, 52, W - 104, H - 104)

  // Vine border between outer and inner frame
  drawVineBorder(ctx, W, H, 26, '#7a9578')

  // Corner ornaments
  const cPos = [[52, 52, 1, 1], [W - 52, 52, -1, 1], [W - 52, H - 52, -1, -1], [52, H - 52, 1, -1]] as [number, number, number, number][]
  cPos.forEach(([x, y, sx, sy]) => drawOrnamentalCorner(ctx, x, y, sx, sy, '#d4a574'))

  // Mushrooms in corners
  ctx.save(); ctx.globalAlpha = 0.82
  drawMushroom(ctx, 78, H / 2 - 40, 22, '#8b4a6b')
  drawMushroom(ctx, 65, H / 2 + 10, 18, '#a05878')
  drawMushroom(ctx, W - 78, H / 2 - 40, 22, '#8b4a6b')
  drawMushroom(ctx, W - 65, H / 2 + 10, 18, '#a05878')
  ctx.restore()

  // Crystals in top corners
  ctx.save(); ctx.globalAlpha = 0.92
  drawCrystalCluster(ctx, 78, 105, '#9b7ab8', 0.85)
  drawCrystalCluster(ctx, W - 78, 105, '#9b7ab8', 0.85)
  ctx.restore()

  // Moon phases top & bottom
  drawMoonPhases(ctx, W / 2, 72, '#d4a574', 9)
  drawMoonPhases(ctx, W / 2, H - 72, '#d4a574', 9)

  // Horizontal dividers
  ctx.strokeStyle = 'rgba(212,165,116,0.2)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(58, 108); ctx.lineTo(W - 58, 108); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(58, H - 108); ctx.lineTo(W - 58, H - 108); ctx.stroke()

  // Central medallion
  const mcx = W / 2, mcy = H / 2
  // Dot ring
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 13) {
    const dx = mcx + Math.cos(a) * 130, dy = mcy + Math.sin(a) * 130
    ctx.fillStyle = 'rgba(212,165,116,0.3)'; ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.save(); ctx.shadowColor = '#d4a574'; ctx.shadowBlur = 24
  ctx.strokeStyle = 'rgba(212,165,116,0.5)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(mcx, mcy, 118, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()
  ctx.strokeStyle = 'rgba(107,77,122,0.4)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(mcx, mcy, 105, 0, Math.PI * 2); ctx.stroke()
  // Large crescent moon
  ctx.save(); ctx.shadowColor = '#d4a574'; ctx.shadowBlur = 45
  ctx.fillStyle = '#d4a574'; ctx.globalAlpha = 0.9
  ctx.beginPath(); ctx.arc(mcx, mcy, 76, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  ctx.fillStyle = '#130f20'
  ctx.beginPath(); ctx.arc(mcx + 30, mcy - 13, 68, 0, Math.PI * 2); ctx.fill()
  // Stars near crescent
  ;[{ x: mcx + 58, y: mcy - 78, s: 10 }, { x: mcx - 44, y: mcy - 88, s: 8 }, { x: mcx + 82, y: mcy + 24, s: 9 }, { x: mcx - 60, y: mcy + 40, s: 7 }, { x: mcx + 38, y: mcy + 82, s: 8 }].forEach(st => {
    ctx.fillStyle = '#d4a574'; ctx.globalAlpha = 0.44
    ctx.font = `${st.s}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('✦', st.x, st.y); ctx.globalAlpha = 1
  })

  // Side dots
  for (let y2 = 125; y2 < H - 125; y2 += 52) {
    ctx.fillStyle = 'rgba(107,77,122,0.3)'
    ctx.beginPath(); ctx.arc(58, y2, 1.8, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(W - 58, y2, 1.8, 0, Math.PI * 2); ctx.fill()
  }

  ctx.fillStyle = '#7a9578'; ctx.globalAlpha = 0.68
  ctx.font = '18px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('✦  ✧  ✦', W / 2, H - 60); ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true; return tex
}

// ─── Front texture ────────────────────────────────────────────────────────────

function drawCardIllustration(ctx: CanvasRenderingContext2D, W: number, H: number, card: CardDef) {
  const cx = W / 2, cy = H * 0.375

  if (card.id === 'about') {
    // ── Large crescent + moth + constellation ──
    // Outer rings
    ctx.save(); ctx.shadowColor = card.accentColor; ctx.shadowBlur = 28
    ctx.strokeStyle = `${card.accentColor}aa`; ctx.lineWidth = 2.2
    ctx.beginPath(); ctx.arc(cx, cy, 132, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
    ctx.strokeStyle = `${card.accentColor}66`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, 118, 0, Math.PI * 2); ctx.stroke()
    // Dot ring
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
      const dx = cx + Math.cos(a) * 142, dy = cy + Math.sin(a) * 142
      ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.2 + Math.sin(a * 4) * 0.1
      ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1
    }
    // Crescent moon
    ctx.save(); ctx.shadowColor = card.accentColor; ctx.shadowBlur = 50
    ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.88
    ctx.beginPath(); ctx.arc(cx, cy, 82, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    ctx.fillStyle = '#0f0c18'
    ctx.beginPath(); ctx.arc(cx + 36, cy - 16, 74, 0, Math.PI * 2); ctx.fill()
    // Moon face (subtle)
    ctx.save()
    ctx.strokeStyle = `${card.accentColor}60`; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5
    // Eye closed
    ctx.beginPath(); ctx.moveTo(cx - 30, cy - 8); ctx.bezierCurveTo(cx - 24, cy - 12, cx - 18, cy - 12, cx - 12, cy - 8); ctx.stroke()
    // Smile
    ctx.beginPath(); ctx.arc(cx - 22, cy + 8, 10, 0.1, Math.PI - 0.1); ctx.stroke()
    ctx.restore()
    // Constellation
    const cStars = [{ x: cx + 60, y: cy - 82 }, { x: cx - 50, y: cy - 96 }, { x: cx + 90, y: cy - 28 }, { x: cx - 80, y: cy + 42 }, { x: cx + 45, y: cy + 96 }, { x: cx - 35, y: cy + 108 }]
    ctx.strokeStyle = `${card.accentColor}25`; ctx.lineWidth = 0.7
    ctx.beginPath(); cStars.forEach((s, i) => i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y)); ctx.stroke()
    cStars.forEach(s => {
      ctx.save(); ctx.shadowColor = '#e8dcc8'; ctx.shadowBlur = 10
      ctx.fillStyle = '#e8dcc8'; ctx.globalAlpha = 0.65
      ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    })
    // Mushroom cluster below moon
    ctx.save(); ctx.globalAlpha = 0.88
    drawMushroom(ctx, cx, cy + 148, 40, '#9b4a72')
    drawMushroom(ctx, cx - 52, cy + 160, 28, '#8b4a6b')
    drawMushroom(ctx, cx + 50, cy + 162, 26, '#a05878')
    drawMushroom(ctx, cx - 26, cy + 170, 18, '#c07898')
    drawMushroom(ctx, cx + 28, cy + 156, 20, '#7a3a5a')
    ctx.restore()
    // Lavender sprigs
    ctx.save(); ctx.globalAlpha = 0.62
    drawSprig(ctx, cx - 152, cy + 20, 0.3, card.accentColor, 1.2)
    drawSprig(ctx, cx + 152, cy + 20, Math.PI - 0.3, card.accentColor, 1.2)
    ctx.restore()
    // Crystal clusters in upper corners of illustration
    ctx.save(); ctx.globalAlpha = 0.88
    drawCrystalCluster(ctx, cx - 138, cy - 88, card.accentColor, 0.72)
    drawCrystalCluster(ctx, cx + 138, cy - 88, card.accentColor, 0.72)
    ctx.restore()

  } else if (card.id === 'formations') {
    // ── Hourglass + constellation + flowing stars ──
    ctx.save(); ctx.shadowColor = card.accentColor; ctx.shadowBlur = 28
    ctx.strokeStyle = `${card.accentColor}aa`; ctx.lineWidth = 2.2
    ctx.beginPath(); ctx.arc(cx, cy, 135, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
    ctx.strokeStyle = `${card.accentColor}66`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI * 2); ctx.stroke()

    // Dot ring
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 14) {
      const dx = cx + Math.cos(a) * 128, dy = cy + Math.sin(a) * 128
      ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.14 + Math.sin(a * 3) * 0.07
      ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1

    // Hourglass shape
    const hgHalfH = 86, hgHalfW = 56, hgWaist = 9
    const hgTop = cy - hgHalfH, hgBot = cy + hgHalfH
    const pathHourglass = () => {
      ctx.beginPath()
      ctx.moveTo(cx - hgHalfW, hgTop)
      ctx.lineTo(cx + hgHalfW, hgTop)
      ctx.bezierCurveTo(cx + hgHalfW, hgTop + 28, cx + hgWaist, cy - 12, cx + hgWaist, cy)
      ctx.bezierCurveTo(cx + hgWaist, cy + 12, cx + hgHalfW, hgBot - 28, cx + hgHalfW, hgBot)
      ctx.lineTo(cx - hgHalfW, hgBot)
      ctx.bezierCurveTo(cx - hgHalfW, hgBot - 28, cx - hgWaist, cy + 12, cx - hgWaist, cy)
      ctx.bezierCurveTo(cx - hgWaist, cy - 12, cx - hgHalfW, hgTop + 28, cx - hgHalfW, hgTop)
      ctx.closePath()
    }

    // Fill
    ctx.save()
    pathHourglass()
    ctx.fillStyle = 'rgba(16, 10, 4, 0.9)'; ctx.fill()
    ctx.restore()

    // Stroke with glow
    ctx.save()
    ctx.shadowColor = card.accentColor; ctx.shadowBlur = 14
    ctx.strokeStyle = card.accentColor; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.92
    pathHourglass(); ctx.stroke()
    ctx.restore()

    // Top and bottom caps
    ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.88
    ctx.fillRect(cx - hgHalfW - 3, hgTop - 10, hgHalfW * 2 + 6, 10)
    ctx.fillRect(cx - hgHalfW - 3, hgBot, hgHalfW * 2 + 6, 10)
    ctx.globalAlpha = 1

    // Stars/sand in top bulb (remaining)
    for (let i = 0; i < 32; i++) {
      const px = cx + Math.sin(i * 2.39) * (hgHalfW * 0.72 * (1 - i / 32 * 0.45))
      const py = hgTop + 18 + (i / 32) * (hgHalfH - 26)
      ctx.fillStyle = card.accentColor
      ctx.globalAlpha = 0.35 + Math.sin(i * 3.1) * 0.25
      ctx.beginPath(); ctx.arc(px, py, 0.9 + Math.cos(i * 1.7) * 0.5, 0, Math.PI * 2); ctx.fill()
    }

    // Stars trickling through waist
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#fff8e0'; ctx.globalAlpha = 0.7 - i * 0.15
      ctx.beginPath(); ctx.arc(cx + (i % 2 === 0 ? 1.5 : -1.5), cy - 8 + i * 5, 1.4, 0, Math.PI * 2); ctx.fill()
    }

    // Stars collected in bottom bulb
    for (let i = 0; i < 16; i++) {
      const spread = hgHalfW * (0.38 + (i / 16) * 0.32)
      const px = cx + Math.sin(i * 1.87) * spread
      const py = hgBot - 16 - (i / 16) * (hgHalfH * 0.55)
      ctx.fillStyle = card.accentColor
      ctx.globalAlpha = 0.55 + Math.sin(i * 2.8) * 0.2
      ctx.beginPath(); ctx.arc(px, py, 0.9 + Math.cos(i * 2.1) * 0.4, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1

    // Faint glow at waist
    ctx.save()
    ctx.shadowColor = card.accentColor; ctx.shadowBlur = 22
    ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.18
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // Constellation stars around hourglass
    const cStars = [
      { x: cx + 78, y: cy - 96 }, { x: cx - 82, y: cy - 82 },
      { x: cx + 112, y: cy + 12 }, { x: cx - 108, y: cy + 26 },
      { x: cx + 62, y: cy + 106 }, { x: cx - 56, y: cy + 114 },
    ]
    ctx.strokeStyle = `${card.accentColor}28`; ctx.lineWidth = 0.7
    ctx.beginPath(); cStars.slice(0, 3).forEach((s, i) => i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y)); ctx.stroke()
    ctx.beginPath(); cStars.slice(3).forEach((s, i) => i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y)); ctx.stroke()
    cStars.forEach(s => {
      ctx.save(); ctx.shadowColor = '#e8dcc8'; ctx.shadowBlur = 8
      ctx.fillStyle = '#e8dcc8'; ctx.globalAlpha = 0.72
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    })

    // Scattered accent stars
    ;[{ x: cx + 52, y: cy - 118 }, { x: cx - 48, y: cy - 110 }, { x: cx + 90, y: cy - 58 },
      { x: cx - 86, y: cy - 46 }, { x: cx + 94, y: cy + 56 }, { x: cx - 90, y: cy + 68 }
    ].forEach((s, i) => {
      ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.65 + (i % 3) * 0.1
      ctx.font = `${8 + (i % 3) * 3}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(i % 2 ? '✧' : '✦', s.x, s.y); ctx.globalAlpha = 1
    })

    // Crystal clusters flanking
    ctx.save(); ctx.globalAlpha = 0.78
    drawCrystalCluster(ctx, cx - 126, cy - 44, card.accentColor, 0.68)
    drawCrystalCluster(ctx, cx + 126, cy - 44, card.accentColor, 0.68)
    ctx.restore()

    // Herb sprigs
    ctx.save(); ctx.globalAlpha = 0.55
    drawSprig(ctx, cx + 140, cy + 18, Math.PI - 0.25, card.accentColor, 1.05)
    drawSprig(ctx, cx - 140, cy + 18, 0.25, card.accentColor, 1.05)
    ctx.restore()

  } else if (card.id === 'contact') {
    // ── Wax seal + spider web + botanical wreath + mushrooms ──
    // Outer ring
    ctx.save(); ctx.shadowColor = card.accentColor; ctx.shadowBlur = 28
    ctx.strokeStyle = `${card.accentColor}aa`; ctx.lineWidth = 2.2
    ctx.beginPath(); ctx.arc(cx, cy, 132, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()

    // Spider web top-right
    ctx.save(); ctx.globalAlpha = 1.0
    drawSpiderWeb(ctx, cx + 108, cy - 98, 72, card.accentColor)
    ctx.restore()

    // Dense botanical wreath
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
      const lx = cx + Math.cos(a) * 112, ly = cy + Math.sin(a) * 112
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(a + Math.PI / 2)
      ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.55 + Math.sin(a * 2) * 0.15
      ctx.beginPath(); ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-6, -4.5, -5, -12, 0, -15)
      ctx.bezierCurveTo(5, -12, 6, -4.5, 0, 0); ctx.fill()
      ctx.restore()
    }
    for (let a = Math.PI / 20; a < Math.PI * 2; a += Math.PI / 10) {
      const lx = cx + Math.cos(a) * 118, ly = cy + Math.sin(a) * 118
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(a + Math.PI / 2)
      ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.38
      ctx.beginPath(); ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-4, -3, -3.5, -9, 0, -11)
      ctx.bezierCurveTo(3.5, -9, 4, -3, 0, 0); ctx.fill(); ctx.restore()
    }

    // Wax seal
    ctx.save(); ctx.shadowColor = card.accentColor; ctx.shadowBlur = 40
    ctx.fillStyle = '#111e14'; ctx.globalAlpha = 0.95
    ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = card.accentColor; ctx.lineWidth = 3.5
    ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = `${card.accentColor}55`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, 68, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()

    // Pentagram in seal
    drawPentagram(ctx, cx, cy, 55, card.accentColor)

    // Seal radial lines
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 9) {
      const ix = cx + Math.cos(a) * 42, iy = cy + Math.sin(a) * 42
      const ox = cx + Math.cos(a) * 64, oy = cy + Math.sin(a) * 64
      ctx.strokeStyle = card.accentColor; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.28
      ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ox, oy); ctx.stroke(); ctx.globalAlpha = 1
    }

    // Quill pen top-left area
    ctx.save()
    ctx.strokeStyle = card.accentColor; ctx.fillStyle = card.accentColor
    ctx.lineWidth = 1.2; ctx.globalAlpha = 0.55
    // Quill
    const qx = cx - 110, qy = cy - 90
    ctx.save(); ctx.translate(qx, qy); ctx.rotate(0.6)
    ctx.beginPath(); ctx.moveTo(0, -38)
    ctx.bezierCurveTo(12, -28, 14, -10, 8, 0)
    ctx.bezierCurveTo(4, 8, -4, 8, -8, 0)
    ctx.bezierCurveTo(-14, -10, -12, -28, 0, -38)
    ctx.fill()
    ctx.fillStyle = '#1a2f1e'; ctx.globalAlpha = 0.6
    ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, 8)
    ctx.bezierCurveTo(-6, 2, -10, -6, -8, 0); ctx.fill()
    // Quill nib
    ctx.fillStyle = '#2a2010'; ctx.globalAlpha = 0.8
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(-3, 22); ctx.lineTo(0, 20); ctx.lineTo(3, 22); ctx.closePath(); ctx.fill()
    ctx.restore(); ctx.restore()

    // Herb sprigs around seal
    ctx.save(); ctx.globalAlpha = 0.65
    drawSprig(ctx, cx - 150, cy + 18, 0.42, card.accentColor, 1.2)
    drawSprig(ctx, cx + 150, cy + 18, Math.PI - 0.42, card.accentColor, 1.2)
    drawSprig(ctx, cx - 125, cy - 75, 0.2, card.accentColor, 0.85)
    drawSprig(ctx, cx + 125, cy - 75, Math.PI - 0.2, card.accentColor, 0.85)
    ctx.restore()

    // Mushroom cluster bottom
    ctx.save(); ctx.globalAlpha = 0.85
    drawMushroom(ctx, cx - 105, cy + 148, 22, '#4a8060')
    drawMushroom(ctx, cx - 88, cy + 142, 16, '#5a9070')
    drawMushroom(ctx, cx + 105, cy + 148, 22, '#4a8060')
    drawMushroom(ctx, cx + 88, cy + 142, 16, '#5a9070')
    ctx.restore()

  } else if (card.id === 'experiences') {
    // ── Compass rose + constellation ──
    // Outer rings
    ctx.save(); ctx.shadowColor = card.accentColor; ctx.shadowBlur = 28
    ctx.strokeStyle = `${card.accentColor}aa`; ctx.lineWidth = 2.2
    ctx.beginPath(); ctx.arc(cx, cy, 132, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
    ctx.strokeStyle = `${card.accentColor}66`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, 118, 0, Math.PI * 2); ctx.stroke()

    // Dot ring
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      const dx = cx + Math.cos(a) * 126, dy = cy + Math.sin(a) * 126
      ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.15 + Math.sin(a * 4) * 0.08
      ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1

    // Inner circle background
    ctx.fillStyle = 'rgba(10, 14, 26, 0.85)'
    ctx.beginPath(); ctx.arc(cx, cy, 78, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = `${card.accentColor}70`; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(cx, cy, 78, 0, Math.PI * 2); ctx.stroke()

    // Intercardinal lines
    ;[-Math.PI * 3 / 4, -Math.PI / 4, Math.PI / 4, Math.PI * 3 / 4].forEach(angle => {
      ctx.strokeStyle = `${card.accentColor}55`; ctx.lineWidth = 1; ctx.globalAlpha = 0.55
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * 50, cy + Math.sin(angle) * 50)
      ctx.stroke(); ctx.globalAlpha = 1
    })

    // Cardinal arms (N, S, E, W)
    ;[[-Math.PI / 2, 72], [Math.PI / 2, 72], [0, 66], [Math.PI, 66]].forEach(([angle, len]) => {
      ctx.save()
      ctx.shadowColor = card.accentColor; ctx.shadowBlur = 10
      ctx.strokeStyle = card.accentColor; ctx.lineWidth = 2; ctx.globalAlpha = 0.88
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len)
      ctx.stroke(); ctx.restore()
    })

    // Diamond points at N, S, E, W
    const drawDiamond = (dx: number, dy: number, size: number) => {
      ctx.save()
      ctx.shadowColor = card.accentColor; ctx.shadowBlur = 16
      ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.95
      ctx.beginPath()
      ctx.moveTo(dx, dy - size)
      ctx.lineTo(dx + size * 0.38, dy)
      ctx.lineTo(dx, dy + size * 0.6)
      ctx.lineTo(dx - size * 0.38, dy)
      ctx.closePath(); ctx.fill(); ctx.restore()
    }
    drawDiamond(cx, cy - 72, 14)
    drawDiamond(cx, cy + 72, 14)
    drawDiamond(cx + 66, cy, 12)
    drawDiamond(cx - 66, cy, 12)

    // Center glow dot
    ctx.save()
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 22
    ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.9
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // Constellation stars
    const cStars = [
      { x: cx + 72, y: cy - 92 }, { x: cx - 68, y: cy - 96 },
      { x: cx + 110, y: cy + 16 }, { x: cx - 106, y: cy + 28 },
      { x: cx + 58, y: cy + 110 }, { x: cx - 52, y: cy + 114 },
    ]
    ctx.strokeStyle = `${card.accentColor}28`; ctx.lineWidth = 0.7
    ctx.beginPath(); cStars.slice(0, 3).forEach((s, i) => i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y)); ctx.stroke()
    ctx.beginPath(); cStars.slice(3).forEach((s, i) => i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y)); ctx.stroke()
    cStars.forEach(s => {
      ctx.save(); ctx.shadowColor = '#c8d8f0'; ctx.shadowBlur = 8
      ctx.fillStyle = '#c8d8f0'; ctx.globalAlpha = 0.72
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    })

    // Accent stars
    ;[{ x: cx + 50, y: cy - 118 }, { x: cx - 46, y: cy - 112 }, { x: cx + 90, y: cy - 58 },
      { x: cx - 86, y: cy - 48 }, { x: cx + 94, y: cy + 58 }, { x: cx - 90, y: cy + 72 }
    ].forEach((s, i) => {
      ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.65 + (i % 3) * 0.1
      ctx.font = `${8 + (i % 3) * 3}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(i % 2 ? '✧' : '✦', s.x, s.y); ctx.globalAlpha = 1
    })

    // Crystal clusters flanking
    ctx.save(); ctx.globalAlpha = 0.72
    drawCrystalCluster(ctx, cx - 128, cy - 44, card.accentColor, 0.68)
    drawCrystalCluster(ctx, cx + 128, cy - 44, card.accentColor, 0.68)
    ctx.restore()

    // Herb sprigs
    ctx.save(); ctx.globalAlpha = 0.55
    drawSprig(ctx, cx + 142, cy + 20, Math.PI - 0.28, card.accentColor, 1.05)
    drawSprig(ctx, cx - 142, cy + 20, 0.28, card.accentColor, 1.05)
    ctx.restore()
  }
}

function createFrontTexture(card: CardDef): THREE.CanvasTexture {
  const W = 512, H = 896
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  if (card.id === 'about') {
    bg.addColorStop(0, '#1c1230'); bg.addColorStop(0.55, '#100d1e'); bg.addColorStop(1, '#0a0810')
  } else if (card.id === 'formations') {
    bg.addColorStop(0, '#1e1510'); bg.addColorStop(0.55, '#120f08'); bg.addColorStop(1, '#0a0808')
  } else if (card.id === 'experiences') {
    bg.addColorStop(0, '#0e1420'); bg.addColorStop(0.55, '#0a0f18'); bg.addColorStop(1, '#080810')
  } else {
    bg.addColorStop(0, '#101e14'); bg.addColorStop(0.55, '#0a1410'); bg.addColorStop(1, '#080a08')
  }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Side gradient
  const sg = ctx.createLinearGradient(0, 0, W, 0)
  sg.addColorStop(0, `${card.accentColor}22`); sg.addColorStop(0.5, 'transparent'); sg.addColorStop(1, `${card.accentColor}22`)
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H)

  drawScatteredStars(ctx, W, H, card.accentColor, 90, 55)

  // Borders
  ctx.strokeStyle = card.accentColor; ctx.lineWidth = 5; ctx.strokeRect(10, 10, W - 20, H - 20)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.strokeRect(22, 22, W - 44, H - 44)
  ctx.strokeStyle = card.accentColor; ctx.lineWidth = 2; ctx.strokeRect(42, 42, W - 84, H - 84)
  ctx.strokeStyle = `${card.accentColor}33`; ctx.lineWidth = 1; ctx.strokeRect(52, 52, W - 104, H - 104)

  // Dense vine border
  drawVineBorder(ctx, W, H, 32, card.accentColor)

  // Corner ornaments
  drawOrnamentalCorner(ctx, 52, 52, 1, 1, card.accentColor)
  drawOrnamentalCorner(ctx, W - 52, 52, -1, 1, card.accentColor)
  drawOrnamentalCorner(ctx, W - 52, H - 52, -1, -1, card.accentColor)
  drawOrnamentalCorner(ctx, 52, H - 52, 1, -1, card.accentColor)

  // Mushrooms in bottom corners of card
  ctx.save(); ctx.globalAlpha = 0.5
  if (card.id === 'about') {
    drawMushroom(ctx, 72, H - 170, 20, '#8b4a6b')
    drawMushroom(ctx, 58, H - 154, 15, '#a05878')
    drawMushroom(ctx, W - 72, H - 170, 20, '#8b4a6b')
    drawMushroom(ctx, W - 58, H - 154, 15, '#a05878')
  }
  ctx.restore()

  // Roman numeral
  const romanNumerals = ['I', 'II', 'III', 'IV']
  const romanIndex = ['about', 'formations', 'experiences', 'contact'].indexOf(card.id)
  ctx.fillStyle = card.accentColor; ctx.globalAlpha = 1.0
  ctx.font = '700 17px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(romanNumerals[romanIndex] ?? 'I', W / 2, 56); ctx.globalAlpha = 1

  // Moon phases strip
  drawMoonPhases(ctx, W / 2, 78, card.accentColor, 6)

  // Top divider with ornament
  ctx.strokeStyle = card.accentColor; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.85
  ctx.beginPath(); ctx.moveTo(60, 102); ctx.lineTo(W / 2 - 22, 102); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W / 2 + 22, 102); ctx.lineTo(W - 60, 102); ctx.stroke()
  ctx.globalAlpha = 1; ctx.fillStyle = card.accentColor; ctx.font = '14px serif'; ctx.textAlign = 'center'
  ctx.fillText('◆', W / 2, 102)

  // Ghost symbol background
  ctx.save(); ctx.shadowColor = card.accentColor; ctx.shadowBlur = 65
  ctx.fillStyle = card.accentColor; ctx.globalAlpha = 0.08
  ctx.font = 'bold 240px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(card.symbol, W / 2, H * 0.375); ctx.restore()

  // Card-specific illustration
  drawCardIllustration(ctx, W, H, card)

  // Middle divider
  ctx.strokeStyle = card.accentColor; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.88
  ctx.beginPath(); ctx.moveTo(60, H * 0.635); ctx.lineTo(W - 60, H * 0.635); ctx.stroke()
  ctx.globalAlpha = 1; ctx.fillStyle = card.accentColor; ctx.font = '15px serif'; ctx.textAlign = 'center'
  ctx.fillText('· ✦ ·', W / 2, H * 0.635)

  // Dark panel behind title area for contrast
  ctx.save()
  ctx.fillStyle = 'rgba(4, 2, 8, 0.82)'
  ctx.fillRect(62, H * 0.640, W - 124, H * 0.185)
  ctx.restore()

  // Title
  ctx.save()
  ctx.fillStyle = '#f5f2ee'
  ctx.font = '700 50px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(card.label.toUpperCase(), W / 2, H * 0.693)
  ctx.restore()

  // Subtitle
  const subtitles: Record<string, string> = { about: '☽  the self  ☽', formations: '✦  the path  ✦', contact: '✉  the thread  ✉', experiences: '✵  the journey  ✵' }
  ctx.save()
  ctx.fillStyle = card.accentColor
  ctx.globalAlpha = 0.9
  ctx.font = 'italic 18px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(subtitles[card.id] ?? '', W / 2, H * 0.745)
  ctx.restore()

  // Botanical sides near title
  ctx.save(); ctx.globalAlpha = 0.65
  drawSprig(ctx, 54, H * 0.71, -0.12, card.accentColor, 0.85)
  drawSprig(ctx, W - 54, H * 0.71, Math.PI + 0.12, card.accentColor, 0.85)
  ctx.restore()

  // Bottom divider
  ctx.strokeStyle = card.accentColor; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.75
  ctx.beginPath(); ctx.moveTo(60, H * 0.825); ctx.lineTo(W - 60, H * 0.825); ctx.stroke()
  ctx.globalAlpha = 1

  // Bottom ornaments
  ctx.fillStyle = card.accentColor; ctx.globalAlpha = 1.0
  ctx.font = '22px serif'; ctx.textAlign = 'center'
  ctx.fillText('· · ·', W / 2, H - 54)
  ctx.font = '14px serif'
  ctx.fillText('✧', 60, 58); ctx.fillText('✧', W - 60, 58)
  ctx.fillText('✧', 60, H - 54); ctx.fillText('✧', W - 60, H - 54)
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true; return tex
}

// ─── TarotCard component ──────────────────────────────────────────────────────

interface TarotCardProps {
  def: CardDef
  isActive: boolean
  isAnyActive: boolean
  onSelect: (id: string) => void
  dealDelay: number
}

function TarotCard({ def, isActive, isAnyActive, onSelect, dealDelay }: TarotCardProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const glowLightRef = useRef<PointLight>(null)
  const materialFrontRef = useRef<THREE.MeshStandardMaterial>(null)
  const materialBackRef = useRef<THREE.MeshStandardMaterial>(null)
  const glowBorderRef = useRef<THREE.MeshBasicMaterial>(null)

  const [isHovered, setIsHovered] = useState(false)

  const flipProgress = useRef(0)
  const hoverLift = useRef(0)
  const activeLift = useRef(0)
  const glowIntensity = useRef(0)
  const dimProgress = useRef(0)
  const dealProgress = useRef(0)
  const dealClock = useRef(0)
  const settledBaseY = useRef(-4)

  const backTexture = useMemo(() => createBackTexture(), [])
  const frontTexture = useMemo(() => createFrontTexture(def), [def])
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const ctx2d = canvas.getContext('2d')!
    // Plane is 3.0 × 4.6 units, card is 2.0 × 3.3 units
    // Map card rect onto the 256×256 canvas
    const ratioX = 2.0 / 3.0   // card width / plane width
    const ratioY = 3.3 / 4.6   // card height / plane height
    const cw = 256 * ratioX    // card width in canvas px (~171)
    const ch = 256 * ratioY    // card height in canvas px (~183)
    const cx = (256 - cw) / 2
    const cy = (256 - ch) / 2
    // Draw the card rect with a glowing shadow, then punch out the interior
    ctx2d.clearRect(0, 0, 256, 256)
    ctx2d.shadowColor = def.accentColor
    ctx2d.shadowBlur = 14
    ctx2d.fillStyle = def.accentColor + 'ff'
    ctx2d.fillRect(cx, cy, cw, ch)
    // Erase the solid filled rect — leaves only the outer shadow/glow
    ctx2d.globalCompositeOperation = 'destination-out'
    ctx2d.shadowBlur = 0
    ctx2d.fillStyle = 'rgba(0,0,0,1)'
    ctx2d.fillRect(cx, cy, cw, ch)
    return new THREE.CanvasTexture(canvas)
  }, [def.accentColor])

  useEffect(() => {
    return () => {
      frontTexture.dispose()
      backTexture.dispose()
      glowTexture.dispose()
      document.body.style.cursor = 'auto'
    }
  }, [frontTexture, backTexture])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(def.id)
  }, [def.id, onSelect])

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(true)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    setIsHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  useFrame((_state, delta) => {
    dealClock.current += delta
    if (dealClock.current > dealDelay && dealProgress.current < 1) {
      dealProgress.current = Math.min(1, dealProgress.current + delta / 0.65)
    }
    const t = dealProgress.current
    const ease = 1 - Math.pow(1 - t, 3)

    hoverLift.current = THREE.MathUtils.lerp(hoverLift.current, isHovered ? 1 : 0, 1 - Math.pow(0.02, delta))
    activeLift.current = THREE.MathUtils.lerp(activeLift.current, isActive ? 1 : 0, 1 - Math.pow(0.015, delta))
    glowIntensity.current = THREE.MathUtils.lerp(glowIntensity.current, isActive ? 1 : (isHovered ? 0.7 : 0), 1 - Math.pow(0.02, delta))
    dimProgress.current = THREE.MathUtils.lerp(dimProgress.current, (isAnyActive && !isActive) ? 1 : 0, 1 - Math.pow(0.02, delta))

    if (groupRef.current) {
      if (dealProgress.current < 1) {
        groupRef.current.position.x = THREE.MathUtils.lerp(0, def.position[0], ease)
        groupRef.current.position.z = THREE.MathUtils.lerp(0, def.position[2], ease)
        settledBaseY.current = THREE.MathUtils.lerp(-4, def.position[1], ease)
      } else {
        const snap = 1 - Math.pow(0.005, delta)
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, def.position[0], snap)
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, def.position[2], snap)
        settledBaseY.current = THREE.MathUtils.lerp(settledBaseY.current, def.position[1], snap)
      }
      groupRef.current.position.y = settledBaseY.current + hoverLift.current * 0.2 + activeLift.current * 0.4
    }

    if (glowLightRef.current) glowLightRef.current.intensity = 0.3 + glowIntensity.current * 2.5
    if (glowBorderRef.current) glowBorderRef.current.opacity = hoverLift.current * 0.75

    if (materialFrontRef.current) {
      materialFrontRef.current.emissiveIntensity = 0.75 + glowIntensity.current * 0.5
      materialFrontRef.current.opacity = 1 - dimProgress.current * 0.5
    }
    if (materialBackRef.current) {
      materialBackRef.current.emissiveIntensity = 0.65 + glowIntensity.current * 0.4
      materialBackRef.current.opacity = 1 - dimProgress.current * 0.5
    }

    flipProgress.current = THREE.MathUtils.lerp(flipProgress.current, isActive ? 1 : 0, 1 - Math.pow(0.008, delta))

    if (meshRef.current) {
      meshRef.current.rotation.y = flipProgress.current * Math.PI
      meshRef.current.scale.setScalar(1 - dimProgress.current * 0.08)
    }
  })

  return (
    <group ref={groupRef} position={[0, -4, 0]}>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[3.0, 4.6]} />
        <meshBasicMaterial ref={glowBorderRef} map={glowTexture} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} castShadow receiveShadow>
        <boxGeometry args={[2.0, 3.3, 0.02]} />
        <meshStandardMaterial attach="material-0" color="#12091c" roughness={0.8} />
        <meshStandardMaterial attach="material-1" color="#12091c" roughness={0.8} />
        <meshStandardMaterial attach="material-2" color="#12091c" roughness={0.8} />
        <meshStandardMaterial attach="material-3" color="#12091c" roughness={0.8} />
        <meshStandardMaterial attach="material-4" ref={materialFrontRef} map={frontTexture} emissiveMap={frontTexture} emissive="#ffffff" emissiveIntensity={0.75} roughness={0.4} metalness={0.1} transparent />
        <meshStandardMaterial attach="material-5" ref={materialBackRef} map={backTexture} emissiveMap={backTexture} emissive="#ffffff" emissiveIntensity={0.65} roughness={0.4} metalness={0.1} transparent />
      </mesh>
      <pointLight ref={glowLightRef} position={[0, 0.5, 0]} intensity={0} color={def.accentColor} distance={2.5} />
    </group>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── TarotCards (scene root) ──────────────────────────────────────────────────

export interface TarotCardsProps {
  activeSection: string | null
  onCardSelect: (id: string | null) => void
}

export function TarotCards({ activeSection, onCardSelect }: TarotCardsProps) {
  const { t } = useLanguage()
  const { size } = useThree()
  const sceneGroupRef = useRef<Group>(null)
  const [isPortrait, setIsPortrait] = useState(false)
  const prevPortrait = useRef(false)

  const slotOrder = useMemo(() => shuffle([0, 1, 2, 3]), [])

  const dynamicSlots = isPortrait ? PORTRAIT_SLOTS : LANDSCAPE_SLOTS

  const cards: CardDef[] = useMemo(() => {
    const defs = [
      { id: 'about', symbol: '☽', label: t.about.title, accentColor: '#6b4d7a' },
      { id: 'formations', symbol: '✦', label: t.formations.title, accentColor: '#d4a574' },
      { id: 'experiences', symbol: '✵', label: t.experiences.title, accentColor: '#8099b8' },
      { id: 'contact', symbol: '✉', label: t.contact.title, accentColor: '#7a9578' },
    ]
    return defs.map((def, i) => ({
      ...def,
      position: dynamicSlots[slotOrder[i]].position,
    }))
  }, [t, slotOrder, dynamicSlots])

  const handleSelect = useCallback((id: string) => {
    onCardSelect(activeSection === id ? null : id)
  }, [activeSection, onCardSelect])

  useFrame(() => {
    if (!sceneGroupRef.current) return

    // Orientation detection
    const portrait = size.height > size.width
    if (portrait !== prevPortrait.current) {
      prevPortrait.current = portrait
      setIsPortrait(portrait)
    }

    // Responsive scale based on orientation
    const s = portrait
      ? (size.width < 480 ? 0.95 : size.width < 768 ? 0.90 : 0.85)
      : (size.width < 380 ? 0.50 : size.width < 480 ? 0.62
          : size.width < 680 ? 0.80 : size.width < 900 ? 0.95 : 1.05)
    sceneGroupRef.current.scale.setScalar(s)
    // Shift slightly down in portrait to account for header > footer
    sceneGroupRef.current.position.y = portrait ? -0.3 : 0
  })

  return (
    <group ref={sceneGroupRef}>
      {cards.map((card, i) => (
        <TarotCard
          key={card.id}
          def={card}
          isActive={activeSection === card.id}
          isAnyActive={activeSection !== null}
          onSelect={handleSelect}
          dealDelay={i * 0.18}
        />
      ))}
    </group>
  )
}
