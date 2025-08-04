// rocket-animation.js
class RocketAnimation extends HTMLElement {
  constructor() {
    super();
    // Shadow DOM 생성 (격리된 스타일/스크립트 공간)
    const shadow = this.attachShadow({ mode: 'open' });

    // 스타일
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; width: 100%; height: 100%; position: relative; }
      canvas { width:100%; height:100%; display:block; background:#0b1020; }
      .label {
        position:absolute; top:8px; left:8px;
        color:#e7ecff; font:14px/1 system-ui;
        background:rgba(0,0,0,0.5); padding:4px 8px; border-radius:4px;
      }
    `;

    // 레이블
    const label = document.createElement('div');
    label.className = 'label';
    label.innerHTML = `
      <strong>추력 F</strong> ⎯ 파란 화살표<br>
      <strong>배기 플룸</strong> ⎯ 흰 점들
    `;

    // 캔버스
    const canvas = document.createElement('canvas');
    shadow.append(style, label, canvas);

    // 애니메이션 로직 (IIFE)
    (function(ctx, container) {
      const dpr = window.devicePixelRatio || 1;
      function resize() {
        const w = container.clientWidth * dpr;
        const h = container.clientHeight * dpr;
        canvas.width = w; canvas.height = h;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }
      window.addEventListener('resize', resize);
      resize();

      // 고정 파라미터
      const mdot=200, ve=3000, Ae=1.2;
      const pe=40e3, pa=101.3e3, g0=9.80665;
      const F = mdot*ve + (pe-pa)*Ae;

      // 파티클 배열
      const parts = [];
      function spawn() {
        parts.push({
          x: 220,
          y: container.clientHeight/2 + (Math.random()*20-10),
          vx: 200 + Math.random()*100,
          t: 0, life: 1+Math.random()*1,
          size: 2+Math.random()*3
        });
        if (parts.length>400) parts.shift();
      }

      let last=0;
      function loop(ts) {
        const dt = (ts-last)/1000;
        last = ts;
        // 배경
        ctx.fillStyle = '#0b1020';
        ctx.fillRect(0,0,container.clientWidth, container.clientHeight);

        // 로켓 그리기
        ctx.save();
        ctx.translate(220, container.clientHeight/2);
        ctx.fillStyle = '#cfd8ff';
        ctx.beginPath();
        ctx.moveTo(-120,-20); ctx.lineTo(0,-20); ctx.lineTo(20,0);
        ctx.lineTo(0,20); ctx.lineTo(-120,20); ctx.closePath();
        ctx.fill();
        // 노즐
        ctx.fillStyle = '#9bb3ff';
        ctx.beginPath();
        ctx.moveTo(0,-20);
        ctx.quadraticCurveTo(50,-14,90,-8);
        ctx.lineTo(90,8);
        ctx.quadraticCurveTo(50,14,0,20);
        ctx.fill();
        // 추력 벡터
        const mag = Math.min(260, Math.log10(1+F/5000)*80);
        ctx.strokeStyle = '#65d6a1';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(90,0); ctx.lineTo(90+mag,0); ctx.stroke();
        ctx.fillStyle = '#65d6a1';
        ctx.beginPath();
        ctx.moveTo(90+mag,0);
        ctx.lineTo(90+mag-12,-8);
        ctx.lineTo(90+mag-12,8);
        ctx.closePath(); ctx.fill();
        ctx.restore();

        // 파티클
        spawn();
        parts.forEach(p=>{
          p.t += dt;
          p.x += p.vx*dt;
          const a = Math.max(0, 1 - p.t/p.life);
          ctx.fillStyle = `rgba(255,255,255,${0.2*a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, 2*Math.PI);
          ctx.fill();
        });

        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    })(canvas.getContext('2d'), this.shadowRoot.host);
  }
}

// 엘리먼트 등록
customElements.define('rocket-animation', RocketAnimation);
