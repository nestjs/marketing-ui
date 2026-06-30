import { useEffect, useState } from "react";
import SpotlightCard from "../../effects/spotlight-card/spotlight-card";
import classes from "./action-bar.module.scss";

export function ActionBar({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const handleScroll = () => {
      const isDesktop = mq.matches;
      const scrolled = window.scrollY >= window.innerHeight;

      setVisible(isDesktop && scrolled);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-10 z-50 max-w-[768px] w-auto left-1/2 -translate-x-1/2
      transition duration-400 ease-in-out
      ${visible ? "opacity-100 pointer-events-auto blur-1" : "opacity-0 pointer-events-none sm:block blur-0 translate-y-10"}`}
    >
      <div className="sm:rounded-[32px] rounded-[16px] relative overflow-hidden">
        <SpotlightCard>
          <div
            className={`${classes.panel} flex items-center p-1 sm:rounded-[32px] rounded-[16px] justify-between lg:justify-start bg-gradient-to-b from-[#161616] to-[#050303]`}
          >
            {children}
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
