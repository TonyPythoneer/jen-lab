<template>
  <div class="envelope-stage" aria-hidden="true">
    <div class="animated-mail">
      <div class="back-fold" />
      <div class="letter">
        <div class="letter-border" />
        <div class="letter-title" />
        <div class="letter-context" />
        <div class="letter-stamp" />
      </div>
      <div class="top-fold" />
      <div class="body" />
      <div class="left-fold" />
    </div>
  </div>
</template>

<style scoped>
.envelope-stage {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.animated-mail {
  position: absolute;
  bottom: 50px;
  left: 0;
  height: 150px;
  width: 200px;
  animation: mail-rise 5s ease-in-out infinite;
}

.animated-mail .back-fold {
  position: absolute;
  bottom: 0;
  width: 200px;
  height: 100px;
  background: #cf4a43;
  z-index: 0;
}

.animated-mail .body {
  position: absolute;
  bottom: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 100px 200px;
  border-color: transparent transparent #e95f55 transparent;
  z-index: 2;
}

.animated-mail .top-fold {
  position: absolute;
  top: 50px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 50px 100px 0 100px;
  border-color: #cf4a43 transparent transparent transparent;
  transform-origin: 50% 0%;
  z-index: 2;
  animation: mail-top-fold 5s ease-in-out infinite;
}

.animated-mail .left-fold {
  position: absolute;
  bottom: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 50px 0 50px 100px;
  border-color: transparent transparent transparent #e15349;
  z-index: 2;
}

.animated-mail .letter {
  left: 20px;
  bottom: 0;
  position: absolute;
  width: 160px;
  height: 60px;
  background: white;
  z-index: 1;
  overflow: hidden;
  animation: mail-letter-grow 5s ease-in-out infinite;
}

.animated-mail .letter-border {
  height: 10px;
  width: 100%;
  background: repeating-linear-gradient(
    -45deg,
    #cb5a5e,
    #cb5a5e 8px,
    transparent 8px,
    transparent 18px
  );
}

.animated-mail .letter-title {
  margin-top: 10px;
  margin-left: 5px;
  height: 10px;
  width: 40%;
  background: #cb5a5e;
}

.animated-mail .letter-context {
  margin-top: 10px;
  margin-left: 5px;
  height: 10px;
  width: 20%;
  background: #cb5a5e;
}

.animated-mail .letter-stamp {
  margin-top: 30px;
  margin-left: 120px;
  border-radius: 100%;
  height: 30px;
  width: 30px;
  background: #cb5a5e;
  opacity: 0.3;
}

/* 5s 週期：蓋子翻開 + 信封下移（10–18%）→ 信紙伸出（14–22%）→ 靜止（22–60%）
   → 信紙縮回（60–68%）→ 蓋子關 + 信封回位（68–76%）→ 靜止（76–100%） */
@keyframes mail-rise {
  0%,
  10% {
    transform: translateY(0);
  }
  18%,
  68% {
    transform: translateY(50px);
  }
  76%,
  100% {
    transform: translateY(0);
  }
}

@keyframes mail-top-fold {
  0%,
  10% {
    transform: rotateX(0deg);
    z-index: 2;
  }
  18%,
  68% {
    transform: rotateX(180deg);
    z-index: 0;
  }
  76%,
  100% {
    transform: rotateX(0deg);
    z-index: 2;
  }
}

@keyframes mail-letter-grow {
  0%,
  14% {
    height: 60px;
  }
  22%,
  60% {
    height: 180px;
  }
  68%,
  100% {
    height: 60px;
  }
}
</style>
