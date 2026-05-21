import { FadeIn, FadeOut, SlideInRight, SlideOutLeft, ZoomIn, BounceIn } from 'react-native-reanimated';

export const fadeIn = FadeIn.duration(300);
export const fadeOut = FadeOut.duration(200);
export const slideIn = SlideInRight.duration(300).springify();
export const slideOut = SlideOutLeft.duration(200).springify();
export const zoomIn = ZoomIn.duration(300).springify();
export const bounceIn = BounceIn.duration(400).springify();

export const stagger = (delay: number) => (index: number) => ({
  entering: fadeIn.delay(delay * index),
});

export function getEntering(index: number) {
  return fadeIn.delay(80 * index);
}
