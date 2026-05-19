<script setup lang="ts">
const communityDotField = {
  color: "var(--color-cyber-violet)",
  opacity: 0.22,
  spacing: 28,
  size: 1.5,
  style: {
    maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, black 30%, transparent 100%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, black 30%, transparent 100%)",
  },
};

const communityPills = [
  { label: "Threads", icon: "i-simple-icons-threads", count: "3.6K" },
  { label: "RSS", icon: "i-lucide-rss", count: "2.7K" },
  { label: "Email", icon: "i-lucide-mail", count: "1.1K" },
];

const toast = useToast();
const subscribeEmail = ref("");
function onSubscribe() {
  if (!subscribeEmail.value) return;
  toast.add({
    title: "Thanks — placeholder.",
    description: "Backend not wired yet. Your email won't be stored anywhere this round.",
    color: "primary",
  });
  subscribeEmail.value = "";
}
</script>

<template>
  <section
    class="relative overflow-hidden py-[72px] sm:py-[140px] flex flex-col items-center gap-8"
  >
    <HomeBackgroundDots v-bind="communityDotField" />

    <h2
      class="relative z-10 font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-center text-5xl md:text-6xl lg:text-7xl"
    >
      Join The jen-lab<br />Community.
    </h2>

    <div class="relative z-10 w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-[760px]">
      <div
        v-for="pill in communityPills"
        :key="pill.label"
        class="bg-ash-white rounded-card px-6 py-5 flex items-center gap-3.5"
      >
        <span
          class="size-9 rounded-xl bg-digital-orange text-pure-white inline-flex items-center justify-center shrink-0"
        >
          <UIcon :name="pill.icon" class="size-5" />
        </span>
        <span class="font-display tracking-[0.02em] text-3xl text-abyssal-ink leading-none">{{
          pill.count
        }}</span>
      </div>
    </div>

    <div
      class="relative z-10 w-full max-w-[760px] bg-cyber-violet text-pure-white rounded-card px-8 md:px-12 py-12 flex flex-col items-center gap-6 text-center"
    >
      <h3 class="font-display tracking-[0.02em] leading-[0.95] text-3xl md:text-4xl">
        Sign Up To Be The First To<br />Hear About Posts &amp; Side-Projects.
      </h3>
      <form class="relative w-full max-w-[480px]" @submit.prevent="onSubscribe">
        <input
          v-model="subscribeEmail"
          type="email"
          required
          placeholder="Type your email here"
          class="w-full bg-transparent border border-pure-white/45 text-pure-white placeholder:text-pure-white/55 rounded-input pl-7 pr-16 py-[18px] text-[15px] focus:outline-none focus:border-pure-white focus:ring-4 focus:ring-pure-white/20 transition-[border-color,box-shadow]"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          class="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-pure-white text-cyber-violet flex items-center justify-center font-bold text-lg hover:bg-abyssal-ink hover:text-pure-white transition-colors cursor-pointer"
        >
          →
        </button>
      </form>
      <p class="text-xs text-pure-white/60 uppercase tracking-widest">
        Roughly one email per month · 312 readers · 0 spam
      </p>
    </div>
  </section>
</template>
