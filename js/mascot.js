const DOG_SVG = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <defs>
    <radialGradient id="furBeige" cx="42%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#f2d9b0"/>
      <stop offset="55%" stop-color="#d9a86c"/>
      <stop offset="100%" stop-color="#b88450"/>
    </radialGradient>
    <radialGradient id="furLight" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#f7e6cc"/>
      <stop offset="100%" stop-color="#d9a86c"/>
    </radialGradient>
    <radialGradient id="maskGrad" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#3a3232"/>
      <stop offset="100%" stop-color="#1a1414"/>
    </radialGradient>
    <filter id="dogShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <g class="dog" filter="url(#dogShadow)">
    <!-- queue enroulée serrée sur le dos -->
    <g class="tail" style="transform-origin: 132px 118px;">
      <path d="M132 118 Q148 108 152 94 Q155 80 146 76 Q137 73 134 81 Q132 88 139 90 Q142 91 140 85" 
            stroke="#b88450" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M132 118 Q148 108 152 94 Q155 80 146 76 Q137 73 134 81 Q132 88 139 90 Q142 91 140 85" 
            stroke="#d9a86c" stroke-width="6" fill="none" stroke-linecap="round"/>
    </g>

    <!-- corps compact -->
    <ellipse cx="100" cy="150" rx="40" ry="26" fill="url(#furBeige)" stroke="#9a7040" stroke-width="1.5"/>
    <!-- ventre clair -->
    <ellipse cx="100" cy="156" rx="24" ry="15" fill="url(#furLight)" opacity="0.7"/>

    <!-- pattes (courtes et épaisses) -->
    <g class="legs">
      <!-- arrière gauche -->
      <ellipse cx="74" cy="170" rx="9" ry="13" fill="url(#furBeige)" stroke="#9a7040" stroke-width="1"/>
      <ellipse cx="74" cy="181" rx="8" ry="5" fill="#b88450"/>
      <!-- arrière droite -->
      <ellipse cx="126" cy="170" rx="9" ry="13" fill="url(#furBeige)" stroke="#9a7040" stroke-width="1"/>
      <ellipse cx="126" cy="181" rx="8" ry="5" fill="#b88450"/>
      <!-- avant gauche -->
      <ellipse cx="80" cy="168" rx="8" ry="12" fill="url(#furBeige)" stroke="#9a7040" stroke-width="1"/>
      <ellipse cx="80" cy="179" rx="7" ry="4" fill="#b88450"/>
      <!-- avant droite -->
      <ellipse cx="120" cy="168" rx="8" ry="12" fill="url(#furBeige)" stroke="#9a7040" stroke-width="1"/>
      <ellipse cx="120" cy="179" rx="7" ry="4" fill="#b88450"/>
    </g>

    <!-- tête (grosse et ronde) -->
    <g class="head" style="transform-origin: 100px 82px;">
      <ellipse cx="100" cy="82" rx="52" ry="48" fill="url(#furBeige)" stroke="#9a7040" stroke-width="1.5"/>

      <!-- joues -->
      <ellipse cx="78" cy="92" rx="16" ry="14" fill="url(#furLight)" opacity="0.5"/>
      <ellipse cx="122" cy="92" rx="16" ry="14" fill="url(#furLight)" opacity="0.5"/>

      <!-- oreilles (boutons noirs, tombantes) -->
      <g class="ear-l" style="transform-origin: 58px 50px;">
        <ellipse cx="58" cy="56" rx="14" ry="17" fill="#1a1414" transform="rotate(-20 58 56)"/>
        <ellipse cx="58" cy="58" rx="8" ry="10" fill="#3a3232" transform="rotate(-20 58 58)"/>
      </g>
      <g class="ear-r" style="transform-origin: 142px 50px;">
        <ellipse cx="142" cy="56" rx="14" ry="17" fill="#1a1414" transform="rotate(20 142 56)"/>
        <ellipse cx="142" cy="58" rx="8" ry="10" fill="#3a3232" transform="rotate(20 142 58)"/>
      </g>

      <!-- rides du front (caractéristique carlin) -->
      <path d="M78 58 Q100 52 122 58" stroke="#9a7040" stroke-width="1.2" fill="none" opacity="0.6"/>
      <path d="M82 64 Q100 59 118 64" stroke="#9a7040" stroke-width="1" fill="none" opacity="0.5"/>

      <!-- masque noir (autour des yeux et museau) -->
      <ellipse cx="100" cy="90" rx="38" ry="30" fill="url(#maskGrad)" opacity="0.88"/>

      <!-- museau court et plat -->
      <ellipse cx="100" cy="100" rx="26" ry="16" fill="#2a2222"/>
      <ellipse cx="100" cy="96" rx="22" ry="12" fill="#3a3232"/>

      <!-- truffe -->
      <ellipse cx="100" cy="92" rx="11" ry="8" fill="#0a0808"/>
      <ellipse cx="96" cy="90" rx="4" ry="2.5" fill="#555" opacity="0.5"/>

      <!-- yeux (grands et expressifs) -->
      <g class="eyes">
        <g class="eye eye-l" style="transform-origin: 78px 78px;">
          <ellipse cx="78" cy="78" rx="13" ry="14" fill="#f7e6cc"/>
          <ellipse cx="78" cy="80" rx="9" ry="10" fill="#2a1a0a"/>
          <ellipse cx="78" cy="81" rx="6" ry="7" fill="#0a0a0a"/>
          <circle cx="74" cy="76" r="3.5" fill="#fff"/>
          <circle cx="79" cy="82" r="1.2" fill="#fff" opacity="0.7"/>
        </g>
        <g class="eye eye-r" style="transform-origin: 122px 78px;">
          <ellipse cx="122" cy="78" rx="13" ry="14" fill="#f7e6cc"/>
          <ellipse cx="122" cy="80" rx="9" ry="10" fill="#2a1a0a"/>
          <ellipse cx="122" cy="81" rx="6" ry="7" fill="#0a0a0a"/>
          <circle cx="118" cy="76" r="3.5" fill="#fff"/>
          <circle cx="123" cy="82" r="1.2" fill="#fff" opacity="0.7"/>
        </g>
      </g>

      <!-- bouche -->
      <path d="M90 108 Q100 113 110 108" stroke="#0a0808" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- langue (petite) -->
      <ellipse cx="100" cy="112" rx="5" ry="3" fill="#e87070" opacity="0.8"/>
      <!-- pli du menton -->
      <path d="M94 114 Q100 117 106 114" stroke="#0a0808" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
    </g>
  </g>
</svg>`;

const Mascot = {
  containers: [],
  init() {
    document.querySelectorAll('.mascot').forEach(el => {
      el.innerHTML = DOG_SVG;
      this.containers.push(el);
    });
  },
  setMood(mood) {
    document.querySelectorAll('.mascot').forEach(el => {
      el.classList.remove('mascot-idle','mascot-happy','mascot-sad');
      el.classList.add('mascot-' + mood);
    });
  },
  reset() { this.setMood('idle'); }
};
window.Mascot = Mascot;
Mascot.init();
setTimeout(() => { if (!document.querySelector('.mascot svg')) Mascot.init(); }, 0);
document.addEventListener('DOMContentLoaded', () => { Mascot.init(); });
