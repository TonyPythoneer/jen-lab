import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

interface TextRevealOptions {
  stagger?: number;
  y?: number;
  duration?: number;
  ease?: string;
  delay?: number;
}

export function useTextReveal(target: Ref<HTMLElement | null>, options: TextRevealOptions = {}) {
  const { stagger = 0.03, y = 80, duration = 0.8, ease = "back.out(1.7)", delay = 0 } = options;

  onMounted(() => {
    const el = target.value;
    if (!el) return;

    const split = new SplitText(el, { type: "chars" });
    gsap.set(el, { perspective: 400 });
    gsap.from(split.chars, {
      opacity: 0,
      scale: 0,
      y,
      rotationX: 180,
      transformOrigin: "0% 50% -50",
      ease,
      stagger,
      duration,
      delay,
      onComplete: () => split.revert(),
    });
  });
}
