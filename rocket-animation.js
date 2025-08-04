class RocketPrincipleAnimation extends HTMLElement {
  constructor() {
    super();
    // Shadow DOM을 생성하여 스타일과 DOM을 외부와 격리합니다.
    const shadow = this.attachShadow({ mode: 'open' });

    // 1. 스타일(CSS) 정의
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 800px;
        height: 600px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        --rocket-body-color: #dadce0;
        --rocket-cone-color: #d93025;
        --flame-color-1: #fbbc04;
        --flame-color-2: #f29900;
        --bg-color: #1a0d2d;
        --text-color: #ffffff;
        --vector-color: #4285f4;
        --efficiency-bar-color: #34a853;
        --efficiency-bar-bg: #5f6368;
        --atmosphere-color: rgba(137, 207, 235, 0.2);
      }

      .animation-container {
        width: 100%;
        height: 100%;
        background-color: var(--bg-color);
        color: var(--text-color);
        border: 1px solid var(--vector-color);
        border-radius: 15px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(66, 133, 244, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .scene {
        width: 100%;
        height: 100%;
        position: absolute;
        opacity: 0;
        transition: opacity 0.8s ease-in-out;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .scene.active {
        opacity: 1;
      }
      
      .title {
        position: absolute;
        top: 20px;
        font-size: 28px;
        font-weight: bold;
        text-shadow: 0 0 10px var(--text-color);
      }

      .description {
        position: absolute;
        bottom: 60px; /* Adjusted for controls */
        width: 90%;
        text-align: center;
        font-size: 16px;
        line-height: 1.5;
      }

      .rocket {
        width: 50px;
        position: absolute;
        transition: transform 2s ease-out;
      }

      .rocket-body {
        width: 100%;
        height: 150px;
        background-color: var(--rocket-body-color);
        border-radius: 10px 10px 0 0;
        position: relative;
      }

      .rocket-body::before { /* Nose cone */
        content: '';
        position: absolute;
        top: -50px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 25px solid transparent;
        border-right: 25px solid transparent;
        border-bottom: 50px solid var(--rocket-cone-color);
      }

      .flame {
        position: absolute;
        bottom: -60px;
        left: 50%;
        transform-origin: top center;
        transform: translateX(-50%);
        width: 20px;
        height: 60px;
        background: linear-gradient(var(--flame-color-1), var(--flame-color-2));
        border-radius: 0 0 50% 50%;
        filter: blur(3px);
        opacity: 0;
      }

      /* Scene 1: Thrust */
      #scene1 .rocket { bottom: 100px; left: calc(50% - 25px); }
      #scene1.animate .rocket { transform: translateY(-200px); }
      #scene1.animate .flame { opacity: 1; animation: flicker 0.1s infinite alternate; }

      .vector {
        position: absolute;
        color: var(--vector-color);
        font-weight: bold;
        opacity: 0;
        transition: opacity 1s, transform 1s;
      }
      
      .vector.arrow::after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
      }

      #thrust-vector { bottom: 260px; left: 50%; transform: translateX(-50%); }
      #thrust-vector.arrow::after { border-width: 0 10px 20px 10px; border-color: transparent transparent var(--vector-color) transparent; top: -20px; left: calc(50% - 10px); }
      #action-vector { bottom: 50px; left: 50%; transform: translateX(-50%); }
      #action-vector.arrow::after { border-width: 20px 10px 0 10px; border-color: var(--vector-color) transparent transparent transparent; bottom: -20px; left: calc(50% - 10px); }
      #scene1.animate .vector { opacity: 1; }

      @keyframes flicker {
        from { transform: translateX(-50%) scale(1, 1); }
        to { transform: translateX(-50%) scale(0.9, 1.1); }
      }

      /* Scene 2: Specific Impulse */
      .rocket-isp { top: 200px; }
      #rocket-a { left: 25%; }
      #rocket-b { left: 75%; }
      #scene2 .flame { opacity: 1; animation: flicker 0.1s infinite alternate; }

      .fuel-gauge {
        position: absolute;
        top: 150px;
        width: 100px;
        height: 20px;
        background-color: var(--efficiency-bar-bg);
        border: 2px solid var(--text-color);
        border-radius: 5px;
        transform: translateX(-50%);
      }
      .fuel-level {
        width: 100%;
        height: 100%;
        background-color: var(--efficiency-bar-color);
        border-radius: 3px;
        transition: width 4s linear;
      }
      .isp-label {
        position: absolute;
        top: 120px;
        transform: translateX(-50%);
        font-size: 14px;
        width: 150px;
        text-align: center;
      }
      #scene2.animate #fuel-a .fuel-level { width: 0%; }
      #scene2.animate #fuel-b .fuel-level { width: 50%; transition-duration: 8s; }
      #scene2.animate #rocket-b { transform: translateY(-200px); }
      #scene2.animate #rocket-a { transform: translateY(-100px); }

      /* Scene 3: Vacuum vs Sea Level */
      #scene3 .rocket { bottom: 100px; left: calc(50% - 25px); }
      #scene3 .flame { opacity: 1; animation: flicker 0.1s infinite alternate; transition: transform 1s, border-radius 1s; }
      #atmosphere {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 250px;
        background: var(--atmosphere-color);
        transition: opacity 1s;
      }
      .pressure-arrow {
        position: absolute;
        bottom: 120px;
        width: 50px;
        height: 50px;
        opacity: 0;
        transition: opacity 1s;
      }
      .pressure-arrow::before, .pressure-arrow::after {
        content: '▶';
        position: absolute;
        font-size: 30px;
        color: var(--text-color);
      }
      #pressure-left { left: calc(50% - 80px); }
      #pressure-right { right: calc(50% - 80px); transform: scaleX(-1); }
      #scene3.sea-level #pressure-left, #scene3.sea-level #pressure-right { opacity: 0.7; }
      #scene3.sea-level .flame { transform: translateX(-50%) scale(0.6, 1); }
      #scene3.vacuum #atmosphere { opacity: 0; }
      #scene3.vacuum .flame { transform: translateX(-50%) scale(1.5, 1.2); border-radius: 0 0 80% 80%; }

      /* Scene 4: Enthalpy & Nozzle */
      #nozzle-view { width: 400px; height: 200px; position: relative; overflow: hidden; }
      #nozzle-shape {
        width: 100%;
        height: 100%;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><path d="M0,0 H150 C120,50 120,150 150,200 H0 Z M180,70 Q160,100 180,130 L400,200 L400,0 Z" fill="%23dadce0"/></svg>');
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
      }
      .particle {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: red;
        opacity: 0;
      }
      #enthalpy-label { position: absolute; left: 20px; top: 80px; color: red; font-weight: bold; }
      #kinetic-label { position: absolute; right: 20px; top: 80px; color: var(--vector-color); font-weight: bold; }

      /* Controls */
      #controls {
        position: absolute;
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
      }
      #controls button {
        background-color: var(--vector-color);
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      }
      #controls button:disabled {
        background-color: var(--efficiency-bar-bg);
        cursor: not-allowed;
      }
    `;

    // 2. HTML 구조 정의
    const wrapper = document.createElement('div');
    wrapper.className = 'animation-container';
    wrapper.innerHTML = `
      <div id="scene1" class="scene active">
        <div class="title">1. 추력 (Thrust)</div>
        <div class="rocket">
          <div class="rocket-body"></div>
          <div class="flame"></div>
        </div>
        <div id="thrust-vector" class="vector arrow"><span>추력 (Thrust)</span></div>
        <div id="action-vector" class="vector arrow"><span>가스 분사 (작용)</span></div>
        <div class="description">엔진이 가스를 뒤로 분사하면(작용), 그 반작용으로 로켓은 앞으로 나아가는 힘(추력)을 얻습니다. (뉴턴의 제3법칙)</div>
      </div>

      <div id="scene2" class="scene">
        <div class="title">2. 비추력 (Isp)</div>
        <div id="rocket-a" class="rocket rocket-isp">
          <div class="rocket-body"></div><div class="flame"></div>
          <div class="isp-label">낮은 비추력 (Low Isp)</div>
          <div id="fuel-a" class="fuel-gauge"><div class="fuel-level"></div></div>
        </div>
        <div id="rocket-b" class="rocket rocket-isp">
          <div class="rocket-body"></div><div class="flame"></div>
          <div class="isp-label"><strong>높은 비추력 (High Isp)</strong></div>
          <div id="fuel-b" class="fuel-gauge"><div class="fuel-level"></div></div>
        </div>
        <div class="description">비추력은 엔진의 '연료 효율'입니다. 비추력이 높을수록 동일한 연료로 더 큰 운동량 변화(더 높이)를 만들어냅니다.</div>
      </div>

      <div id="scene3" class="scene">
        <div class="title">3. 해수면 vs. 진공 비추력</div>
        <div id="atmosphere"></div>
        <div class="rocket">
          <div class="rocket-body"></div><div class="flame"></div>
        </div>
        <div id="pressure-left" class="pressure-arrow"></div><div id="pressure-right" class="pressure-arrow"></div>
        <div class="description" id="scene3-desc">해수면에서는 대기압이 배기 가스를 압축하여 효율을 낮춥니다.</div>
      </div>
      
      <div id="scene4" class="scene">
        <div class="title">4. 엔탈피와 드라발 노즐</div>
        <div id="nozzle-view">
          <div id="nozzle-shape"></div>
          <div id="enthalpy-label">높은 엔탈피<br>(열에너지)</div>
          <div id="kinetic-label">높은 운동에너지<br>(속도)</div>
        </div>
        <div class="description">연소실의 높은 열에너지(엔탈피)는 드라발 노즐을 통과하며 빠른 속도의 운동 에너지로 변환되어 추력을 생성합니다.</div>
      </div>

      <div id="controls">
        <button id="prevBtn" disabled>이전</button>
        <button id="nextBtn">다음</button>
      </div>
    `;

    shadow.append(style, wrapper);
    
    // 3. 스크립트(애니메이션 로직) 정의
    // Shadow DOM 내의 요소에 접근하기 위해 shadow.querySelector 사용
    const scenes = shadow.querySelectorAll('.scene');
    const nextBtn = shadow.getElementById('nextBtn');
    const prevBtn = shadow.getElementById('prevBtn');
    let currentSceneIndex = 0;

    const sceneAnimations = [
      // Scene 1: Thrust
      () => {
        const scene = shadow.getElementById('scene1');
        scene.classList.add('animate');
      },
      // Scene 2: Isp
      () => {
        const scene = shadow.getElementById('scene2');
        shadow.querySelector('#fuel-a .fuel-level').style.width = '100%';
        shadow.querySelector('#fuel-b .fuel-level').style.width = '100%';
        shadow.getElementById('rocket-a').style.transform = 'translateY(0)';
        shadow.getElementById('rocket-b').style.transform = 'translateY(0)';
        
        setTimeout(() => scene.classList.add('animate'), 100);
      },
      // Scene 3: Vacuum vs Sea Level
      () => {
        const scene = shadow.getElementById('scene3');
        const desc = shadow.getElementById('scene3-desc');
        scene.className = 'scene active sea-level';
        desc.textContent = '해수면에서는 대기압(하얀 화살표)이 배기 가스를 압축하여 효율을 낮춥니다. (Isp, SL)';
        
        setTimeout(() => {
          scene.classList.remove('sea-level');
          scene.classList.add('vacuum');
          desc.innerHTML = '대기압이 없는 진공에서는 가스가 자유롭게 팽창하여 효율이 극대화됩니다. <strong>(Isp, vac > Isp, SL)</strong>';
        }, 3000);
      },
      // Scene 4: Enthalpy & Nozzle
      () => {
        const nozzleView = shadow.getElementById('nozzle-view');
        // 기존 파티클 제거 후 재생성
        const nozzleShapeHTML = shadow.getElementById('nozzle-shape').outerHTML;
        const enthalpyLabelHTML = shadow.getElementById('enthalpy-label').outerHTML;
        const kineticLabelHTML = shadow.getElementById('kinetic-label').outerHTML;
        nozzleView.innerHTML = nozzleShapeHTML + enthalpyLabelHTML + kineticLabelHTML;
        
        for (let i = 0; i < 30; i++) {
          const p = document.createElement('div');
          p.className = 'particle';
          nozzleView.appendChild(p);
          
          const startX = 20 + Math.random() * 100;
          const startY = 50 + Math.random() * 100;
          const duration = 1.5 + Math.random() * 1;

          p.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            transition: transform ${duration}s linear, background-color ${duration}s linear, opacity ${duration}s linear;
          `;

          setTimeout(() => {
            p.style.opacity = 1;
            const endX = 400;
            const endY = startY + (Math.random() - 0.5) * 150;
            p.style.transform = `translateX(${endX - startX}px) translateY(${endY-startY}px) scale(0.5)`;
            p.style.backgroundColor = 'var(--vector-color)';
          }, Math.random() * 500);
          
          setTimeout(() => { p.style.opacity = 0; }, duration * 1000);
        }
      }
    ];

    function updateScene() {
      scenes.forEach((scene, index) => {
        scene.classList.remove('active', 'animate');
        if (index === currentSceneIndex) {
          scene.classList.add('active');
          if (sceneAnimations[index]) {
            setTimeout(sceneAnimations[index], 100);
          }
        }
      });
      prevBtn.disabled = currentSceneIndex === 0;
      nextBtn.disabled = currentSceneIndex === scenes.length - 1;
    }

    nextBtn.addEventListener('click', () => {
      if (currentSceneIndex < scenes.length - 1) {
        currentSceneIndex++;
        updateScene();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentSceneIndex > 0) {
        currentSceneIndex--;
        updateScene();
      }
    });

    // 컴포넌트가 로드되면 첫 번째 씬을 활성화합니다.
    updateScene();
  }
}

// 'rocket-principle-animation' 이라는 이름으로 커스텀 엘리먼트를 등록합니다.
customElements.define('rocket-principle-animation', RocketPrincipleAnimation);
