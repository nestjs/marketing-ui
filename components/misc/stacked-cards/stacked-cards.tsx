// @ts-ignore
import { gsap } from "gsap/dist/gsap.js";
// @ts-ignore
import { ScrollTrigger } from "gsap/dist/ScrollTrigger.js";
import React, { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

type StackedCardsProps = {
  cards: React.ReactNode[];
};

export default function StackedCards({ cards }: StackedCardsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardWrappersRef = useRef<HTMLDivElement[]>([]);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const wrappers = cardWrappersRef.current;
    const cards = cardsRef.current;

    const ctx = gsap.context(() => {
      const triggers: ScrollTrigger[] = [];

      wrappers.forEach((wrapper, i) => {
        const card = cards[i];
        const isLast = i === cards.length - 1;
        let scale = 1,
          rotationX = 0,
          rotationY = 0;

        if (!isLast) {
          scale = 0;
          rotationX = 30;
          rotationY = i % 2 === 0 ? -10 : 10;
        }

        const tween = gsap.to(card, {
          scale,
          rotationX,
          rotationY,
          transformOrigin: "top center",
          ease: "power1.in",
          scrollTrigger: {
            trigger: card,
            start: window.innerWidth <= 992 ? "top 20" : "top 40",
            end: "bottom 1000",
            endTrigger: wrapperRef.current,
            scrub: true,
            pin: wrapper,
            pinSpacing: false,
            id: i + 1,
            invalidateOnRefresh: true,
            onUpdate: (self: ScrollTrigger) => {
              // Every trigger spans from its card's dock to the end of the
              // whole stack (the shared end keeps the pins, and therefore the
              // stacking, alive). With more than 2 cards self.progress covers
              // several transitions, so normalize it to one transition plus
              // the shared tail — the span the 2-card version was tuned
              // against. The tail lets a card finish its exit behind the card
              // that has already docked on top of it instead of vanishing
              // right at the handoff.
              const nextTrigger = triggers[i + 1];
              const lastTrigger = triggers[cards.length - 1];
              const transition =
                nextTrigger && lastTrigger
                  ? nextTrigger.start -
                    self.start +
                    (self.end - lastTrigger.start)
                  : 0;
              const progress =
                transition > 0
                  ? gsap.utils.clamp(
                      0,
                      1,
                      (self.scroll() - self.start) / transition,
                    )
                  : self.progress;

              const progressOffset = 0.5;
              let adjustedProgress =
                (progress - progressOffset) / (1 - progressOffset);
              adjustedProgress = gsap.utils.clamp(0, 1, adjustedProgress);
              const adjustedOpacity = gsap.utils.clamp(
                0,
                1,
                (0.85 - progress) / (0.85 - 0.75),
              );

              gsap.set(card, {
                scale: 1 + (scale - 1) * adjustedProgress,
                rotationX: rotationX * adjustedProgress,
                rotationY: rotationY * adjustedProgress,
                opacity: isLast ? 1 : adjustedOpacity,
              });

              const factor = gsap.utils.clamp(
                0,
                0.5,
                (window.innerHeight - 854) / 1000,
              );

              const scrollHeight = window.innerHeight * factor;
              wrapperRef.current!.style.marginBottom = `${scrollHeight}px`;

              const nextCard = cards[i + 1];
              if (nextCard) {
                const normalizedProgress = gsap.utils.clamp(0, 1, progress * 2);
                const nextTranslateY = Math.max(
                  0,
                  window.innerHeight * (1 - normalizedProgress),
                );
                gsap.set(nextCard, { translateY: nextTranslateY });
              }
            },
          },
        });

        triggers.push(tween.scrollTrigger);
      });

      ScrollTrigger.refresh();
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const setWrapperRef = (el: HTMLDivElement | null, index: number) => {
    if (el) cardWrappersRef.current[index] = el;
  };
  const setCardRef = (el: HTMLDivElement | null, index: number) => {
    if (el) cardsRef.current[index] = el;
  };

  return (
    <div
      ref={wrapperRef}
      className="wrapper py-24 w-full min-h-screen max-w-[1920px] mx-auto"
    >
      <div className="cards mx-auto w-full px-4 sm:px-5 md:px-8 lg:px-10 flex flex-col gap-12">
        {cards!.map((node, i) => (
          <div
            key={i}
            ref={(el) => setWrapperRef(el, i)}
            className="card-wrapper perspective-500"
          >
            <div
              ref={(el) => setCardRef(el, i)}
              className="card rounded-[24px] bg-cover bg-center h-[98vh] mb-[50vh]"
            >
              {node}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
