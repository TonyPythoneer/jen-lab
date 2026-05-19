<script setup lang="ts">
// NOTE: all testimonials below are fictional placeholders. Replace with real
// quotes before any public deploy.
const testimonials = [
  {
    name: "Skye Harbour",
    org: "Beachside Studio",
    role: "Brand designer",
    quote:
      "Felt like a stroll along the foreshore — I always knew exactly where I was going. The kind of personal site that reads more like a journal than a portfolio.",
    glyph: "coffee" as const,
  },
  {
    name: "Mateo Bondi",
    org: "Night Owl Café",
    role: "Owner / barista",
    quote:
      "Stumbled across this site at 2am and bookmarked half of it. Three of the restaurant picks are now on my regular rotation; the writing kept me reading until close.",
    glyph: "surf" as const,
  },
  {
    name: "Inga Pylon",
    org: "Local Cyclist Co-op",
    role: "Route maker",
    quote:
      "Reminds me of the harbour bridge: bold, useful, hard to miss. The map alone is worth the visit — the side-projects are the dessert.",
    glyph: "ferris" as const,
  },
];
</script>

<template>
  <section class="py-[72px] sm:py-[140px] space-y-8">
    <div class="text-center space-y-3 max-w-2xl mx-auto">
      <span class="text-cyber-violet text-xs uppercase tracking-widest">Echoes</span>
      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-5xl"
      >
        Echoes From
        <span class="block text-digital-orange">The Harbour.</span>
      </h2>
      <p class="text-abyssal-ink/75 leading-relaxed">
        What strangers, friends and the occasional 2am visitor have said. Names are fictional — the
        sentiments are not.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      <article
        v-for="(t, i) in testimonials"
        :key="t.name"
        class="rounded-card p-8 md:p-10 flex flex-col gap-6 min-h-[300px] transition-transform duration-200 hover:scale-[1.005]"
        :class="i === 1 ? 'bg-cyber-violet text-pure-white' : 'bg-ash-white text-abyssal-ink'"
      >
        <div
          class="size-12 rounded-card flex items-center justify-center shrink-0"
          :class="i === 1 ? 'bg-pure-white/15' : 'bg-basalt-canvas'"
        >
          <HomeGlyphSvg aria-hidden="true" :kind="t.glyph" class="size-8" />
        </div>
        <blockquote class="text-base md:text-lg leading-relaxed flex-1 italic">
          "{{ t.quote }}"
        </blockquote>
        <footer class="space-y-0.5">
          <p class="font-medium">{{ t.name }}</p>
          <p :class="i === 1 ? 'text-pure-white/70' : 'text-abyssal-ink/60'" class="text-sm">
            {{ t.role }} · {{ t.org }}
          </p>
        </footer>
      </article>
    </div>
  </section>
</template>
