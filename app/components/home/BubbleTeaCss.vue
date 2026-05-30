<template>
  <div class="bubbletea-wrapper" aria-hidden="true">
    <div class="bubbletea">
      <div class="straw base"><div class="base"></div></div>
      <div class="wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185 45">
          <path
            vector-effect="non-scaling-stroke"
            d="M0,45 C0,21.6998115 0,7.36647816 0,2 C3.80186408,1.91726549 16.4756068,-7.64579944 25,16 C34.1327438,39.5327501 56.8564327,41.4041239 65,28 C73.3597576,13.9200141 88.3445894,-4.8645236 100,16 C112.28186,36.7514742 125.216241,23.5273785 130,16 C135.488132,8.35957216 150.140856,1.42720426 161,17 C172.314988,33.387142 181.927351,22.9080011 185,23 C185,24.627827 185,31.9611604 185,45 Z"
          />
        </svg>
        <div class="tea"></div>
      </div>
      <div class="lid"></div>
      <div class="straw top"><div class="top"></div></div>
      <div class="bubbles">
        <div><span></span><span></span></div>
        <div><span></span><span></span><span></span></div>
        <div><span></span><span></span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bubbletea-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 8px;
}

.bubbletea {
  margin-top: 53px;
  position: relative;
  width: 120px;
  height: 152px;
  border-bottom-right-radius: 54px 50px;
  border-bottom-left-radius: 54px 50px;
  box-shadow: #413c58 0 0 0 4px;
  background: none;
  animation: auto-shake 4s ease-in-out infinite;
}

.bubbletea .tea {
  background: #fcddbc;
  width: 100%;
  transform: scale(1.6, 1.1);
  flex-grow: 2;
  flex-shrink: 2;
  position: relative;
}

.bubbletea .wave {
  border-bottom-right-radius: 54px 50px;
  border-bottom-left-radius: 54px 50px;
  width: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  overflow: hidden;
  height: 152px;
}

.bubbletea .wave svg {
  width: 120%;
  margin-top: 24px;
  overflow: visible;
}

.bubbletea .wave svg path {
  paint-order: stroke;
  stroke: #413c58;
  stroke-width: 20px;
  fill: #fcddbc;
  animation: wavy 1s ease-in-out infinite alternate;
}

@keyframes wavy {
  0% {
    d: path(
      "M0,45 C0,21.6998115 0,7.36647816 0,2 C3.80186408,1.91726549 16.4756068,-7.64579944 25,16 C34.1327438,39.5327501 56.8564327,41.4041239 65,28 C73.3597576,13.9200141 88.3445894,-4.8645236 100,16 C112.28186,36.7514742 125.216241,23.5273785 130,16 C135.488132,8.35957216 150.140856,1.42720426 161,17 C172.314988,33.387142 181.927351,22.9080011 185,23 C185,24.627827 185,31.9611604 185,45 Z"
    );
  }
  100% {
    d: path(
      "M0,45 C0,35.4242644 0,28.0909311 0,23 C3.80186408,22.552727 8.57870222,33.7017924 24,21 C38.8996407,7.85656036 49.5225217,11.5526073 60,22 C70.2426113,33.3837906 79.5591281,35.5872213 97,19 C113.594948,2.33928294 121.051093,30.2458463 136,37 C150.979243,44.3436015 156.979529,34.9601304 166,16 C176.001443,-2.61222005 181.927351,2.57008557 185,3 C185,4.3924177 185,18.3924177 185,45 Z"
    );
  }
}

.bubbletea .lid {
  background: #ecc6d3;
  width: 138px;
  height: 32px;
  border-radius: 100%;
  box-shadow:
    inset #413c58 0 0 0 2px,
    #413c58 0 0 0 2px;
  position: absolute;
  top: -16px;
  left: -10px;
}

.bubbletea .straw {
  width: 20px;
  height: 205px;
  position: absolute;
  bottom: 2%;
  transform-origin: 10px 53px;
  transform: rotate(15.79deg);
  left: 60px;
  animation: auto-shake-straw 4s ease-in-out 0.2s infinite;
}

.bubbletea .straw.base {
  height: 205px;
}

.bubbletea .straw.top {
  height: 53px;
  margin-bottom: 152px;
}

.bubbletea .straw * {
  background: #1f1c2e;
  box-shadow: inset #413c58 0 -198px;
  border-radius: 45% / 4px;
}

.bubbletea .straw .top {
  height: 100%;
  z-index: 1;
  box-shadow: inset #413c58 0 -46px;
}

.bubbletea .straw .base {
  height: 100%;
}

.bubbletea .bubbles {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  margin-top: 97px;
  animation: auto-shake-bubbles 4s ease-in-out 0.15s infinite;
}

.bubbletea .bubbles div {
  display: flex;
}

.bubbletea .bubbles span {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #413c58;
  border-radius: 100%;
  margin: -1.8px 8px;
}

@keyframes auto-shake {
  0%,
  26%,
  100% {
    transform: rotate(0deg);
  }
  5% {
    transform: rotate(-10deg);
  }
  10% {
    transform: rotate(8deg);
  }
  15% {
    transform: rotate(-5deg);
  }
  20% {
    transform: rotate(3deg);
  }
  25% {
    transform: rotate(0deg);
  }
}

@keyframes auto-shake-bubbles {
  0%,
  27.5%,
  100% {
    transform: rotate(0deg);
  }
  5% {
    transform: rotate(-10deg);
  }
  10% {
    transform: rotate(8deg);
  }
  15% {
    transform: rotate(-5deg);
  }
  20% {
    transform: rotate(3deg);
  }
  27.5% {
    transform: rotate(0deg);
  }
}

@keyframes auto-shake-straw {
  0%,
  30%,
  100% {
    transform: rotate(15.79deg);
  }
  5% {
    transform: rotate(9.79deg);
  }
  10% {
    transform: rotate(20.79deg);
  }
  15% {
    transform: rotate(12.79deg);
  }
  20% {
    transform: rotate(18.79deg);
  }
  30% {
    transform: rotate(15.79deg);
  }
}
</style>
