<script setup lang="ts">
// CSS-only Sydney Opera House. Sky removed (transparent) so it floats on any surface.
// Water band at bottom is kept as structural anchor.
</script>

<template>
  <div class="canvas" aria-hidden="true" role="img" aria-label="CSS Sydney Opera House silhouette">
    <div class="sydney_opera_house">
      <div class="building">
        <div class="base"></div>
        <div class="body">
          <div class="body_1"></div>
          <div class="body_2"></div>
          <div class="body_3"></div>
          <div class="body_4"></div>
          <div class="body_5"></div>
          <div class="body_6"></div>
          <div class="body_7"></div>
          <div class="body_8"></div>
        </div>
        <div class="top">
          <div class="top_1"></div>
          <div class="top_2"></div>
          <div class="top_3"></div>
          <div class="top_4"></div>
          <div class="top_5"></div>
          <div class="top_6"></div>
          <div class="top_7"></div>
          <div class="top_8"></div>
          <div class="top_9"></div>
          <div class="top_10"></div>
          <div class="top_11"></div>
          <div class="top_12"></div>
          <div class="top_13"></div>
          <div class="top_14"></div>
          <div class="top_15"></div>
          <div class="top_16"></div>
          <div class="top_17"></div>
          <div class="top_18"></div>
        </div>
      </div>
    </div>
    <div class="water"></div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.canvas {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.water {
  background: dodgerblue;
  height: 150px;
  z-index: 1;
}

.sydney_opera_house {
  background: transparent;
  display: flex;
  flex: 1;
  flex-direction: column-reverse;
  align-items: center;
  --body-background: #fffaf5;
}

.building {
  display: contents;
}

@media (max-width: 767px) {
  .building {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    transform: scaleX(0.5);
    transform-origin: bottom center;
  }
}

.base {
  border-bottom: 5px solid #be9f83;
  height: 25px;
  width: 1200px;
  background: var(--body-background);
  border-radius: 3px;
  box-shadow: 0px -1px 1px #00000022;
  position: relative;
  z-index: 2;
}

.body {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  filter: drop-shadow(0 -1px #b39f83) drop-shadow(0 -5px var(--body-background));
  position: relative;
  z-index: 1;
}

.body_1 {
  height: 90px;
  width: 60px;
  background: var(--body-background);
}

.body_3 {
  height: 110px;
  width: 60px;
  background: var(--body-background);
}

.body_2 {
  height: 90px;
  width: 40px;
  background: var(--body-background);
  transform-origin: 0% 100%;
  transform: scaleX(0.93) perspective(100px) rotateY(-27deg);
}

.body_4 {
  height: 110px;
  width: 100px;
  background: var(--body-background);
  transform-origin: 0% 100%;
  transform: scaleX(1.65) perspective(100px) rotateY(27deg);
}

.body_5 {
  height: 75px;
  width: 60px;
  background: var(--body-background);
}

.body_6 {
  height: 75px;
  width: 60px;
  background: var(--body-background);
  transform-origin: 0% 100%;
  transform: scaleX(1.4) perspective(100px) rotateY(25deg);
}

.body_7 {
  height: 60px;
  width: 540px;
  background: var(--body-background);
}

.body_8 {
  height: 60px;
  width: 80px;
  background: var(--body-background);
  transform-origin: 0% 100%;
  transform: scaleX(1.78) perspective(100px) rotateY(35deg);
}

.top {
  position: relative;
  z-index: 0;
  height: 500px;
  width: 1000px;
}

.top_1 {
  border-radius: 50%;
  width: 210px;
  aspect-ratio: 3/1.2;
  background: #d3d3d3;
  position: absolute;
  bottom: -50px;
  left: -20px;
  z-index: -9;
}

.top_2 {
  background: gray;
  position: absolute;
  width: 50px;
  aspect-ratio: 1/1;
  transform: rotate(20deg) skew(-20deg);
  z-index: -10;
  bottom: -3px;
  left: 35px;
}

.top_3 {
  background: gray;
  position: absolute;
  width: 50px;
  aspect-ratio: 1/1;
  transform: skewY(20deg);
  z-index: -10;
  bottom: 25px;
  left: 53px;
}

.top_4 {
  position: absolute;
  width: 453px;
  height: 229px;
  filter: drop-shadow(-1px 2px black);
  top: 300px;
  left: -230px;
  z-index: -8;
}

.top_4::before {
  content: "";
  display: block;
  background: white;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(40% 0, 100% 0, 100% 100%, 75% 100%, 68.5% 70%, 62.5% 50%, 52.5% 25%);
}

.top_5 {
  position: absolute;
  width: 384px;
  height: 305px;
  top: 320px;
  left: 130px;
  z-index: -7;
}

.top_5::before {
  content: "";
  display: block;
  background: #f1f1f1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(17% 0%, 17% 20%, 18% 30%, 20% 40%, 22% 45%, 40% 80%, 0% 60%, 0% 0%);
}

.top_6 {
  position: absolute;
  width: 384px;
  height: 305px;
  top: 320px;
  left: 130px;
  z-index: -8;
  border-radius: 50%;
  background: #faf8f8;
  clip-path: polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%);
}

.top_7 {
  position: absolute;
  width: 453px;
  height: 229px;
  top: 300px;
  left: -80px;
  z-index: -7;
  transform: scale(1.6) rotate(12deg);
}

.top_7::before {
  content: "";
  display: block;
  background: white;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(40% 0, 90% 0, 79% 100%, 68.5% 70%, 62.5% 50%, 52.5% 25%);
}

.top_8 {
  z-index: -6;
  position: absolute;
  height: 280px;
  width: 140px;
  background: #faf8f8;
  clip-path: polygon(45% 0%, 100% 100%, 0% 100%);
  top: 280px;
  left: 260px;
}

.top_9 {
  position: absolute;
  width: 453px;
  height: 229px;
  top: 225px;
  left: 60px;
  z-index: -7;
  transform: scale(1.2, 1.7) rotate(12deg);
}

.top_9::before {
  content: "";
  display: block;
  background: white;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(40% 0, 100% 0, 100% 100%, 75% 100%, 68.5% 70%, 62.5% 50%, 52.5% 25%);
}

.top_10 {
  position: absolute;
  z-index: -11;
  width: 400px;
  aspect-ratio: 10/1;
  background: black;
  border-radius: 50%;
  transform: rotate(69deg);
  top: 303px;
  left: 130px;
  border: 10px solid white;
}

.top_11 {
  position: absolute;
  z-index: -11;
  width: 300px;
  aspect-ratio: 10/1;
  background: black;
  border-radius: 50%;
  transform: rotate(60deg);
  top: 341px;
  left: 40px;
  border: 5px solid white;
}

.top_12 {
  position: absolute;
  width: 300px;
  height: 365px;
  top: 370px;
  left: 310px;
  z-index: -10;
  transform: scale(-1, 1);
}

.top_12::before {
  content: "";
  display: block;
  background: #ececec;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.top_13 {
  position: absolute;
  width: 467px;
  height: 439px;
  top: 410px;
  left: 280px;
  z-index: -12;
  transform: scale(1, 1);
}

.top_13::before {
  content: "";
  display: block;
  background: #f5f5f5;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.top_14 {
  position: absolute;
  width: 481px;
  height: 313px;
  top: 430px;
  left: 337px;
  z-index: -13;
  background: #ffffff;
  border-radius: 50% / 90% 90% 7% 7%;
  transform: rotate(280deg);
}

.top_15 {
  border-radius: 50%;
  width: 250px;
  aspect-ratio: 2/1;
  background: #d3d3d3;
  position: absolute;
  bottom: -130px;
  left: 750px;
  z-index: -9;
}

.top_16 {
  position: absolute;
  width: 266px;
  height: 153px;
  top: 461px;
  left: 690px;
  z-index: -7;
}

.top_16::before {
  content: "";
  display: block;
  background: white;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(40% 0, 100% 0, 100% 100%, 75% 100%, 68.5% 70%, 62.5% 50%, 52.5% 25%);
}

.top_17 {
  width: 150px;
  aspect-ratio: 5/1;
  border: 5px solid white;
  background: black;
  position: absolute;
  bottom: -40px;
  left: 762px;
  border-radius: 50%;
  transform: rotate(55deg);
  z-index: -12;
}

.top_18 {
  position: absolute;
  width: 237px;
  height: 120px;
  top: 450px;
  left: 898px;
  z-index: -7;
  transform: scale(-1, 1);
}

.top_18::before {
  content: "";
  display: block;
  background: white;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(40% 0, 100% 0, 100% 100%, 75% 100%, 68.5% 70%, 62.5% 50%, 52.5% 25%);
}
</style>
