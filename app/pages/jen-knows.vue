<template>
  <SitePageContainer>
    <ProfilePage v-if="page" :page="page" :display-name="DISPLAY_NAME" brand="jen-knows" />
  </SitePageContainer>
</template>

<script setup lang="ts">
import { useProfileRoute } from "~/composables/useProfileRoute";

const DISPLAY_NAME = "Jen Knows";
const { page } = useProfileRoute({ slug: "jen-knows", headTitle: "榛知 | NextSteps Academy" });
</script>
