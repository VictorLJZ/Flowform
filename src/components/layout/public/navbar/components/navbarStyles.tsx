"use client"

// Shared styles for animations in the navbar
export const NavbarStyles = () => (
  <style jsx global>{`
    .glow-border-container {
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    
    .glow-border {
      pointer-events: none;
      z-index: 1;
    }

    .glow-border::before {
      content: '';
      position: absolute;
      /* Adjust inset to match the border precisely with the container edge */
      inset: 0.5px;
      /* Tailwind rounded-lg = 0.5rem (8px) */
      border-radius: calc(0.5rem + 1px);
      padding: 2px;
      background: linear-gradient(90deg, #3888fd, #11a59e, #8c4dc8, #3888fd);
      background-size: 300% 100%;
      animation: textGradientAnimation 4s linear infinite;
      -webkit-mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
      mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
    
    .glow-border-bg {
      background-color: transparent;
      z-index: 0;
    }

    .rainbow-gradient-text {
      background: linear-gradient(90deg, #3888fd, #11a59e, #8c4dc8, #3888fd);
      background-size: 300% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textGradientAnimation 4s linear infinite;
    }

    .rainbow-gradient-icon {
      position: relative;
      display: flex;
    }

    .rainbow-gradient-mask {
      background: linear-gradient(90deg, #3888fd, #11a59e, #8c4dc8, #3888fd);
      background-size: 300% 100%;
      animation: textGradientAnimation 4s linear infinite;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1 !important;
    }
    
    @keyframes borderRotate {
      0%, 100% {
        border-image: linear-gradient(90deg, rgba(56,139,253,0.8), rgba(17,94,89,0.8), rgba(111,66,193,0.8), rgba(56,139,253,0.8)) 1;
      }
      25% {
        border-image: linear-gradient(180deg, rgba(56,139,253,0.8), rgba(17,94,89,0.8), rgba(111,66,193,0.8), rgba(56,139,253,0.8)) 1;
      }
      50% {
        border-image: linear-gradient(270deg, rgba(56,139,253,0.8), rgba(17,94,89,0.8), rgba(111,66,193,0.8), rgba(56,139,253,0.8)) 1;
      }
      75% {
        border-image: linear-gradient(360deg, rgba(56,139,253,0.8), rgba(17,94,89,0.8), rgba(111,66,193,0.8), rgba(56,139,253,0.8)) 1;
      }
    }

    @keyframes textGradientAnimation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes iconColorRotation {
      0% { filter: hue-rotate(0deg) saturate(2.5) brightness(1.2) drop-shadow(0px 0px 2px rgba(56, 139, 253, 0.5)); }
      25% { filter: hue-rotate(90deg) saturate(2.7) brightness(1.25) drop-shadow(0px 0px 2px rgba(17, 165, 158, 0.5)); }
      50% { filter: hue-rotate(180deg) saturate(2.8) brightness(1.3) drop-shadow(0px 0px 2px rgba(140, 77, 200, 0.5)); }
      75% { filter: hue-rotate(270deg) saturate(2.7) brightness(1.25) drop-shadow(0px 0px 2px rgba(56, 139, 253, 0.5)); }
      100% { filter: hue-rotate(360deg) saturate(2.5) brightness(1.2) drop-shadow(0px 0px 2px rgba(56, 139, 253, 0.5)); }
    }

    @keyframes gradientMove {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(50%); }
    }
    
    .rainbow-icon-svg {
      z-index: 20;
      position: relative;
    }
    
    .rainbow-icon-svg path {
      fill: url(#rainbowGradient) !important;
    }

    .rainbow-icon-svg linearGradient {
      animation: none;
    }
  `}</style>
);
