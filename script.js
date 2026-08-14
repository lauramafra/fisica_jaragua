// ══════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════
const btns = document.querySelectorAll('.tnav-btn');
function showChapter(i) {
  document.querySelectorAll('.chapter').forEach((c,j)=>{
    c.classList.toggle('active', i===j);
  });
  btns.forEach((b,j)=>b.classList.toggle('active', i===j));
  if(i===0) drawFaraday();
  if(i===1) start3phase();
  if(i===2) startMotor();
  if(i===3) { updateJoule(); drawJouleBar(); }
  if(i===4) drawAntenna();
}

// Cor de fundo padronizada para os canvas baseada no novo CSS var(--bg)
const canvasBg = '#0b1a15'; 

// ══════════════════════════════════════════════════
//  CAP 1 — FARADAY GENERATOR
// ══════════════════════════════════════════════════
let animId1;
function updateFaraday() {
  const rpm = +document.getElementById('rpm1').value;
  document.getElementById('rpm1v').textContent = rpm + ' RPM';
  const emf = (rpm / 3000) * 220;
  const cur = emf / 100;
  document.getElementById('emf_val').textContent = 'ε = ' + emf.toFixed(1) + ' V';
  document.getElementById('cur_val').textContent = 'I = ' + cur.toFixed(2) + ' A';
  if(animId1) cancelAnimationFrame(animId1);
  drawFaraday();
}

let t1 = 0;
function drawFaraday() {
  const canvas = document.getElementById('c1');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  const W = canvas.width, H = canvas.height;
  const rpm = +document.getElementById('rpm1').value;
  const speed = rpm / 3000;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0,0,W,H);

  // Draw coil
  const cx = W * 0.35, cy = H * 0.5;
  const angle = t1 * speed * 0.08;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.strokeStyle = '#ffd500'; /* Amarelo bandeira */
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 18, 0, 0, Math.PI*2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff'; /* Branco bandeira */
  ctx.lineWidth = 2;
  for(let i=-1;i<=1;i+=2){
    ctx.beginPath();
    ctx.moveTo(i*40, 0);
    ctx.lineTo(i*58, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Field lines
  for(let y = H*0.2; y < H*0.85; y += 22) {
    const alpha = 0.15 + speed * 0.4;
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4,6]);
    ctx.beginPath();
    ctx.moveTo(cx - 80, y);
    ctx.lineTo(cx + 80, y);
    ctx.stroke();
    ctx.setLineDash([]);
    if(speed > 0.1) {
      const ax = cx + 60;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(ax, y); ctx.lineTo(ax-6, y-4); ctx.lineTo(ax-6, y+4);
      ctx.fill();
    }
  }

  // Wire + lamp
  const lx = W * 0.78, ly = H * 0.5;
  ctx.strokeStyle = '#8caba1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx+58, cy); ctx.lineTo(lx-22, cy-40);
  ctx.moveTo(cx-58, cy); ctx.lineTo(lx-22, cy+40);
  ctx.stroke();

  // Lamp bulb
  const brightness = speed;
  const r = 22;
  const grd = ctx.createRadialGradient(lx,ly,0,lx,ly,r*2);
  if(brightness > 0.01) {
    grd.addColorStop(0, `rgba(255,240,140,${brightness})`);
    grd.addColorStop(0.4, `rgba(255,213,0,${brightness*0.7})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(lx, ly, r*2.5, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.strokeStyle = brightness > 0.1 ? `rgba(255,220,80,${0.4+brightness*0.6})` : '#333';
  ctx.lineWidth = 2;
  ctx.fillStyle = brightness > 0.1 ? `rgba(255,240,160,${brightness})` : '#1a1a1a';
  ctx.beginPath();
  ctx.arc(lx, ly, r, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // Labels
  ctx.fillStyle = '#8caba1';
  ctx.font = '11px Segoe UI';
  ctx.fillText('Bobina', cx-18, H-8);
  ctx.fillText('Lâmpada', lx-28, H-8);

  t1++;
  if(rpm > 0) animId1 = requestAnimationFrame(drawFaraday);
}
updateFaraday();

// ══════════════════════════════════════════════════
//  CAP 2 — 3-PHASE FIELD
// ══════════════════════════════════════════════════
let t2 = 0, anim2;
function update3phase() {
  const f = +document.getElementById('freq2').value;
  document.getElementById('freq2v').textContent = f + ' Hz';
}
function start3phase() {
  if(anim2) cancelAnimationFrame(anim2);
  draw3phase();
}
function draw3phase() {
  const canvas = document.getElementById('c2');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  const W = canvas.width, H = canvas.height;
  const f = +document.getElementById('freq2').value;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0,0,W,H);

  const graphH = H * 0.42;
  const graphY = 14;
  const graphW = W - 40;
  const colors = ['#d32f2f','#009c7b','#ffffff']; /* Cores da bandeira */
  const labels = ['Fase A','Fase B','Fase C'];
  const speed = f / 60 * 0.04;

  // Draw waveforms
  for(let ph=0; ph<3; ph++) {
    ctx.strokeStyle = colors[ph];
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let x=0; x<graphW; x++) {
      const angle = (x / graphW) * Math.PI * 4 + t2 * speed + ph * (2*Math.PI/3);
      const y = graphY + graphH/2 - Math.sin(angle) * graphH * 0.38;
      if(x===0) ctx.moveTo(x+20, y); else ctx.lineTo(x+20, y);
    }
    ctx.stroke();
    ctx.fillStyle = colors[ph];
    ctx.font = '11px Segoe UI';
    ctx.fillText(labels[ph], W-60, graphY + graphH/2 - Math.sin(t2*speed + ph*(2*Math.PI/3)) * graphH*0.38);
  }

  // Rotating field vector circle
  const cx2 = W/2, cy2 = H*0.74, R = 52;
  ctx.strokeStyle = '#265243';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx2, cy2, R, 0, Math.PI*2);
  ctx.stroke();

  // 3 stator poles
  for(let i=0; i<3; i++) {
    const a = (i/3)*Math.PI*2;
    const px = cx2 + Math.cos(a)*R, py = cy2 + Math.sin(a)*R;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI*2);
    ctx.fill();
  }

  // Resultant field vector
  let fx=0, fy=0;
  for(let i=0; i<3; i++) {
    const phaseAngle = t2 * speed + i*(2*Math.PI/3);
    const fieldAngle = (i/3)*Math.PI*2;
    fx += Math.sin(phaseAngle)*Math.cos(fieldAngle);
    fy += Math.sin(phaseAngle)*Math.sin(fieldAngle);
  }
  const mag = Math.sqrt(fx*fx+fy*fy);
  if(mag>0.01) {
    const vx = (fx/mag)*R*0.85, vy = (fy/mag)*R*0.85;
    ctx.strokeStyle = '#ffd500';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx2,cy2);
    ctx.lineTo(cx2+vx, cy2+vy);
    ctx.stroke();
    ctx.fillStyle = '#ffd500';
    ctx.beginPath();
    ctx.arc(cx2+vx, cy2+vy, 5, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.fillStyle = '#8caba1';
  ctx.font = '11px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('Campo Girante Resultante', cx2, cy2+R+16);
  ctx.textAlign = 'left';

  t2++;
  anim2 = requestAnimationFrame(draw3phase);
}
start3phase();

// ══════════════════════════════════════════════════
//  CAP 3 — MOTOR WEG
// ══════════════════════════════════════════════════
let t3=0, anim3;
function updateMotor() {
  const p = +document.getElementById('poles3').value;
  const f = +document.getElementById('freq3').value;
  const n = Math.round(120*f/p);
  document.getElementById('poles3v').textContent = p + ' polos';
  document.getElementById('freq3v').textContent = f + ' Hz';
  document.getElementById('m_rpm').textContent = n;
  document.getElementById('m_polos').textContent = p;
  document.getElementById('m_freq').textContent = f + ' Hz';
  document.getElementById('m_calc').textContent = `120 × ${f} / ${p} = ${n} RPM`;
}
function startMotor() {
  if(anim3) cancelAnimationFrame(anim3);
  drawMotor();
}
function drawMotor() {
  const canvas = document.getElementById('c3');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  const W = canvas.width, H = canvas.height;
  const poles = +document.getElementById('poles3').value;
  const freq = +document.getElementById('freq3').value;
  const n = 120*freq/poles;
  const speed = n / 3600 * 0.06;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0,0,W,H);

  const cx = W/2, cy = H/2, R = Math.min(W,H)*0.34;

  // Stator
  ctx.strokeStyle = '#265243';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, R+6, 0, Math.PI*2);
  ctx.stroke();

  // Poles on stator
  for(let i=0; i<poles; i++) {
    const a = (i/poles)*Math.PI*2 + t3*0.001;
    const r1 = R-4, r2 = R+4;
    const col = i%2===0 ? '#d32f2f' : '#ffffff';
    ctx.strokeStyle = col;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a-0.18, a+0.18);
    ctx.stroke();
  }

  // Rotor
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t3 * speed);
  for(let i=0; i<8; i++) {
    const a = (i/8)*Math.PI*2;
    ctx.strokeStyle = `rgba(255,213,0,${0.4+0.5*(i%2)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(a)*(R-22), Math.sin(a)*(R-22));
    ctx.stroke();
  }
  ctx.strokeStyle = '#ffd500';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0,0,R-22,0,Math.PI*2);
  ctx.stroke();
  ctx.fillStyle = '#1a382e';
  ctx.beginPath();
  ctx.arc(0,0,12,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#ffd500';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0,0,12,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();

  // RPM label
  ctx.fillStyle = '#ffd500';
  ctx.font = `bold ${Math.min(20,14+poles)}px Segoe UI`;
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(n)+' RPM', cx, cy+5);
  ctx.font = '11px Segoe UI';
  ctx.fillStyle = '#8caba1';
  ctx.fillText(poles+' polos', cx, cy+20);
  ctx.textAlign = 'left';

  t3++;
  anim3 = requestAnimationFrame(drawMotor);
}
startMotor();

// ══════════════════════════════════════════════════
//  CAP 4 — JOULE LOSSES
// ══════════════════════════════════════════════════
function updateJoule() {
  const P = +document.getElementById('pow4').value * 1e6;
  const R = +document.getElementById('res4').value;
  document.getElementById('pow4v').textContent = (P/1e6).toFixed(0) + ' MW';
  document.getElementById('res4v').textContent = R + ' Ω';

  const Vlow = 13800, Vhigh = 500000;
  const Ilow = P/Vlow, Ihigh = P/Vhigh;
  const lossLow = Ilow*Ilow*R, lossHigh = Ihigh*Ihigh*R;
  const pctLow = (lossLow/P*100), pctHigh = (lossHigh/P*100);

  document.getElementById('loss_low').textContent = (lossLow/1e6).toFixed(1)+' MW';
  document.getElementById('loss_high').textContent = (lossHigh/1e3).toFixed(1)+' kW';
  document.getElementById('loss_low_pct').textContent = pctLow.toFixed(1)+'% de perda';
  document.getElementById('loss_high_pct').textContent = pctHigh.toFixed(3)+'% de perda';
  drawJouleBar(lossLow, lossHigh, P);
}
function drawJouleBar(lossLow, lossHigh, P) {
  const canvas = document.getElementById('c4');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  const W = canvas.width, H = canvas.height;
  if(!lossLow) {
    const pwr = +document.getElementById('pow4').value * 1e6;
    const R = +document.getElementById('res4').value;
    const il = pwr/13800, ih = pwr/500000;
    lossLow = il*il*R; lossHigh = ih*ih*R; P=pwr;
  }
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0,0,W,H);

  const max = Math.max(lossLow, P);
  const bw = (W-80)/2, bh = H-50, bx1=40, bx2=40+bw+20, by=10;

  [[bx1, lossLow,'#d32f2f','Baixa Tensão\n13,8 kV'],[bx2,lossHigh,'#009c7b','Alta Tensão\n500 kV']].forEach(([bx,loss,col,label])=>{
    const barH = Math.min((loss/max)*bh, bh);
    ctx.fillStyle = '#1a382e';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = col;
    ctx.fillRect(bx, by+bh-barH, bw, barH);
    ctx.fillStyle = col;
    ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center';
    const pct = loss/P*100;
    ctx.fillText(pct < 1 ? pct.toFixed(3)+'%' : pct.toFixed(1)+'%', bx+bw/2, by+bh-barH-8);
    ctx.fillStyle = '#8caba1';
    ctx.font = '11px Segoe UI';
    const lines = label.split('\n');
    ctx.fillText(lines[0], bx+bw/2, by+bh+16);
    ctx.fillText(lines[1], bx+bw/2, by+bh+30);
  });
}

// ══════════════════════════════════════════════════
//  CAP 5 — ANTENNA
// ══════════════════════════════════════════════════
let antennaPos = null;
function updateAntenna() {
  document.getElementById('freq5v').textContent = document.getElementById('freq5').value + ' MHz';
  drawAntenna();
}
function placeAntenna(e) {
  const rect = e.target.getBoundingClientRect();
  antennaPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  drawAntenna();
}
function drawAntenna() {
  const canvas = document.getElementById('antennaCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  const W = canvas.width, H = canvas.height;
  
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0,0,W,H);
  
  // Dummy topo map
  ctx.fillStyle = '#11261f';
  ctx.beginPath();
  ctx.moveTo(0,H);
  for(let x=0; x<=W; x+=10) {
    const y = H - 30 - Math.sin(x*0.02)*40 - Math.sin(x*0.05)*20;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W,H);
  ctx.fill();
  
  if(!antennaPos) {
    ctx.fillStyle = '#8caba1';
    ctx.textAlign = 'center';
    ctx.font = '12px Segoe UI';
    ctx.fillText('Clique no mapa para posicionar a antena', W/2, H/2);
    return;
  }
  
  const freq = +document.getElementById('freq5').value;
  const range = (3500 - freq + 1000) / 10;
  
  ctx.strokeStyle = `rgba(255,213,0,0.5)`;
  ctx.beginPath();
  ctx.arc(antennaPos.x, antennaPos.y, range, 0, Math.PI*2);
  ctx.stroke();
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(antennaPos.x, antennaPos.y, 4, 0, Math.PI*2);
  ctx.fill();
  // City labels
  const cityLabels = [
    {x:0.15, label:'Nereu Ramos'},
    {x:0.35, label:'Morro do Boa Vista'},
    {x:0.55, label:'Centro'},
    {x:0.72, label:'Serra Azul'},
    {x:0.88, label:'Amizade'}
  ];
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '10px Segoe UI';
  cityLabels.forEach(({x,label})=>{
    const px = x*W;
    const py = H - terrain[Math.floor(px)]*H*0.65 - 6;
    ctx.textAlign = 'center';
    ctx.fillText(label, px, py);
  });
  ctx.textAlign = 'left';
}