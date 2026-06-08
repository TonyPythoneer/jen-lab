<template>
  <SitePageContainer>
    <ProfilePage v-if="page" :page="page" :display-name="DISPLAY_NAME" brand="jen-liu" />
  </SitePageContainer>
</template>

<script setup lang="ts">
import { useProfileRoute } from "~/composables/useProfileRoute";

const DISPLAY_NAME = "Jen Liu";
const { page } = useProfileRoute({ slug: "jen-liu", headTitle: "榛知 | 澳洲旅遊作家" });
</script>
