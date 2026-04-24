<template>
  <div class="flex flex-col gap-3">
    <UCarousel v-slot="{ item }" dots :items="videos" class="w-full mb-8">
      <button
        class="flex flex-col gap-1.5 group w-full text-left"
        @click="openVideo(item)"
      >
        <div class="relative rounded-4xl overflow-hidden aspect-video bg-gray-100">
          <img
            :src="`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-red-600 transition-colors">
              <UIcon name="i-lucide-play" class="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
        </div>
      </button>
    </UCarousel>

    <UModal v-model:open="isOpen" :ui="{ content: 'p-0 overflow-hidden' }" fullscreen>
      <template #content>
        <div class="relative w-full h-full bg-black flex items-center justify-center">
          <button
            class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
            @click="closeVideo"
          >
            <UIcon name="i-lucide-x" class="w-5 h-5 text-white" />
          </button>
          <iframe
            v-if="activeVideoId"
            :src="`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`"
            class="w-full aspect-video max-h-screen"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const videos = [
  { id: 'J7AWXUoq9ck', title: 'Breaking Into the Australian Tech Industry: What No One Tells You' },
  { id: 'b2k3oprSEOI', title: '華人在澳洲職場如何升職加薪？實用職涯規劃經驗分享' },
  { id: 'qCT8OUpRO6k', title: '【榛知】澳洲第二大科技公司 Canva 總部開箱 | 超浮誇早午餐 | 調酒啤酒喝到飽 | 紀念品隨便拿... 拜託現在就收下我的履歷吧！' },
  { id: 'VEG9qwcEvco', title: '【榛知】澳洲最大科技公司 Atlassian 福利有多好?! 雪梨總部開箱+員工訪問' },
]

const isOpen = ref(false)
const activeVideoId = ref<string | null>(null)

function openVideo(item: { id: string }) {
  activeVideoId.value = item.id
  isOpen.value = true
}

function closeVideo() {
  isOpen.value = false
  activeVideoId.value = null
}
</script>
