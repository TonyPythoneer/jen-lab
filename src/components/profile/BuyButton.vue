<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[60] grid place-items-center bg-abyssal-ink/40 backdrop-blur-sm"
        @click="cancel"
      >
        <!-- @click.stop so clicks inside the button area don't hit the backdrop.
             Ring width + animation length are fed to the scoped CSS as vars. -->
        <div
          class="relative"
          :style="{ '--ring-width': `${ringWidth}px`, '--anim-duration': `${durationMs}ms` }"
          @click.stop
        >
          <!-- Pill-shaped ring matching the button; depletes clockwise from the top. -->
          <div class="buy-ring pointer-events-none" aria-hidden="true" />

          <!-- Sparks scatter randomly and keep firing through the countdown. -->
          <span
            v-for="(s, i) in sparks"
            :key="i"
            class="buy-spark"
            :style="{
              '--a': `${s.angle}deg`,
              '--dist': `${s.dist}px`,
              '--size': `${s.size}px`,
              '--delay': `${s.delay}s`,
              '--dur': `${s.dur}s`,
            }"
            aria-hidden="true"
          />

          <!-- Clicking the pill skips the countdown and opens the store now. -->
          <button
            type="button"
            class="relative whitespace-nowrap rounded-full bg-digital-orange px-8 py-4 text-lg font-bold text-pure-white shadow-lg transition-colors hover:bg-[#e34800] md:px-12 md:py-6 md:text-2xl"
            @click="goToStore"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    purchaseUrl: string;
    // ── Tunable knobs (override per use, or change the defaults below) ──
    sparkCount?: number; // how many sparks
    sparkSpread?: number; // px · how far sparks fly outward
    sparkSize?: number; // px · spark thickness (largest)
    ringWidth?: number; // px · outer ring line thickness
    durationMs?: number; // ms · ring countdown + redirect delay
  }>(),
  {
    sparkCount: 72,
    sparkSpread: 320,
    sparkSize: 12,
    ringWidth: 10,
    durationMs: 3000,
  },
);

const open = defineModel<boolean>("open", { default: false });

const LABELS = ["真棒，我要這個！", "為您導引至購物賣場", "手刀支持！"];

interface Spark {
  angle: number; // degrees — random scatter direction
  dist: number; // px travelled outward
  size: number; // px thickness
  delay: number; // s — staggered across the countdown
  dur: number; // s — per-spark lifetime
}

const label = ref(LABELS[0]);
const sparks = ref<Spark[]>([]);
let redirectTimer: ReturnType<typeof setTimeout> | undefined;

// Random sparks that keep firing for the whole countdown — they loop and only
// stop when the modal closes. Regenerated each open so the scatter differs.
function makeSparks(): Spark[] {
  return Array.from({ length: props.sparkCount }, () => ({
    angle: Math.random() * 360,
    dist: props.sparkSpread * (0.55 + Math.random() * 0.45),
    size: props.sparkSize * (0.6 + Math.random() * 0.4),
    delay: Math.random() * (props.durationMs / 1000),
    dur: 0.8 + Math.random() * 0.7,
  }));
}

function clearTimer() {
  if (redirectTimer) clearTimeout(redirectTimer);
  redirectTimer = undefined;
}

// Open the store and close. Clicking the pill calls this too — it skips the
// rest of the countdown and goes straight in.
function goToStore() {
  clearTimer();
  open.value = false;
  window.open(props.purchaseUrl, "_blank", "noopener");
}

function cancel() {
  clearTimer();
  open.value = false;
}

// Start the countdown when opened; tidy up if it closes for any other reason.
watch(open, (isOpen) => {
  if (!isOpen) {
    clearTimer();
    return;
  }
  label.value = LABELS[Math.floor(Math.random() * LABELS.length)];
  sparks.value = makeSparks();
  redirectTimer = setTimeout(goToStore, props.durationMs);
});

onKeyStroke("Escape", () => {
  if (open.value) cancel();
});
onBeforeUnmount(clearTimer);
</script>

<style scoped>
/* Animatable angle for the conic depletion — needs @property to tween. */
@property --buy-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

/* Pill ring: a conic gradient masked to a band. The transparent wedge grows
   clockwise from 12 o'clock, erasing the line top → right → bottom → gone. */
.buy-ring {
  position: absolute;
  inset: -0.85rem;
  border-radius: 9999px;
  padding: var(--ring-width, 5px); /* ring thickness */
  background: conic-gradient(
    from 0deg,
    transparent var(--buy-angle),
    var(--color-digital-orange) var(--buy-angle)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: buy-ring-deplete var(--anim-duration, 3s) linear forwards;
}
@keyframes buy-ring-deplete {
  from {
    --buy-angle: 0deg;
  }
  to {
    --buy-angle: 360deg;
  }
}

/* Sparks: bigger, random direction (--a) + distance (--dist); loop through the
 * countdown and stop only when the modal closes. */
.buy-spark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--size);
  height: calc(var(--size) * 3.4);
  margin-top: calc(var(--size) * -1.7);
  margin-left: calc(var(--size) / -2);
  border-radius: 9999px;
  background: var(--color-digital-orange);
  pointer-events: none;
  animation: buy-spark-burst var(--dur) ease-out var(--delay) infinite;
}
@keyframes buy-spark-burst {
  0% {
    transform: rotate(var(--a)) translateY(0) scale(0.3);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--a)) translateY(calc(var(--dist) * -1)) scale(1);
    opacity: 0;
  }
}
</style>
