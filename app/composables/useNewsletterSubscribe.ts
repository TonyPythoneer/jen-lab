export function useNewsletterSubscribe() {
  const toast = useToast();
  const email = ref("");

  function onSubscribe() {
    if (!email.value) return;
    toast.add({
      title: "Thanks — placeholder.",
      description: "Backend not wired yet. Your email won't be stored anywhere this round.",
      color: "primary",
    });
    email.value = "";
  }

  return { email, onSubscribe };
}
