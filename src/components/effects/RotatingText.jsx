import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import "./RotatingText.css";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const RotatingText = forwardRef(function RotatingText(props, ref) {
  const {
    texts = [],
    transition = { type: "spring", damping: 25, stiffness: 300 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    animatePresenceMode = "wait",
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = "first",
    loop = true,
    auto = true,
    splitBy = "characters",
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const safeTexts = Array.isArray(texts) ? texts.filter((text) => typeof text === "string" && text.length > 0) : [];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const splitIntoCharacters = useCallback((text) => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return Array.from(segmenter.segment(text), (segment) => segment.segment);
    }

    return Array.from(text);
  }, []);

  const elements = useMemo(() => {
    const currentText = safeTexts[currentTextIndex] ?? "";

    if (splitBy === "characters") {
      const words = currentText.split(" ");
      return words.map((word, index) => ({
        characters: splitIntoCharacters(word),
        needsSpace: index !== words.length - 1
      }));
    }

    if (splitBy === "words") {
      return currentText.split(" ").map((word, index, array) => ({
        characters: [word],
        needsSpace: index !== array.length - 1
      }));
    }

    if (splitBy === "lines") {
      return currentText.split("\n").map((line, index, array) => ({
        characters: [line],
        needsSpace: index !== array.length - 1
      }));
    }

    return currentText.split(splitBy).map((part, index, array) => ({
      characters: [part],
      needsSpace: index !== array.length - 1
    }));
  }, [currentTextIndex, safeTexts, splitBy, splitIntoCharacters]);

  const getStaggerDelay = useCallback(
    (index, totalChars) => {
      const total = totalChars;

      if (staggerFrom === "first") {
        return index * staggerDuration;
      }

      if (staggerFrom === "last") {
        return (total - 1 - index) * staggerDuration;
      }

      if (staggerFrom === "center") {
        const center = Math.floor(total / 2);
        return Math.abs(center - index) * staggerDuration;
      }

      if (staggerFrom === "random") {
        const randomIndex = Math.floor(Math.random() * total);
        return Math.abs(randomIndex - index) * staggerDuration;
      }

      return Math.abs(staggerFrom - index) * staggerDuration;
    },
    [staggerDuration, staggerFrom]
  );

  const handleIndexChange = useCallback(
    (newIndex) => {
      setCurrentTextIndex(newIndex);
      onNext?.(newIndex);
    },
    [onNext]
  );

  const next = useCallback(() => {
    if (safeTexts.length <= 1) {
      return;
    }

    const nextIndex =
      currentTextIndex === safeTexts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;

    if (nextIndex !== currentTextIndex) {
      handleIndexChange(nextIndex);
    }
  }, [currentTextIndex, handleIndexChange, loop, safeTexts.length]);

  const previous = useCallback(() => {
    if (safeTexts.length <= 1) {
      return;
    }

    const previousIndex =
      currentTextIndex === 0 ? (loop ? safeTexts.length - 1 : currentTextIndex) : currentTextIndex - 1;

    if (previousIndex !== currentTextIndex) {
      handleIndexChange(previousIndex);
    }
  }, [currentTextIndex, handleIndexChange, loop, safeTexts.length]);

  const jumpTo = useCallback(
    (index) => {
      const validIndex = Math.max(0, Math.min(index, safeTexts.length - 1));

      if (validIndex !== currentTextIndex) {
        handleIndexChange(validIndex);
      }
    },
    [currentTextIndex, handleIndexChange, safeTexts.length]
  );

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0);
    }
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(
    ref,
    () => ({
      next,
      previous,
      jumpTo,
      reset
    }),
    [jumpTo, next, previous, reset]
  );

  useEffect(() => {
    if (!auto || safeTexts.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(next, rotationInterval);
    return () => window.clearInterval(intervalId);
  }, [auto, next, rotationInterval, safeTexts.length]);

  if (safeTexts.length === 0) {
    return null;
  }

  return (
    <motion.span className={cn("text-rotate", mainClassName)} {...rest} layout transition={transition}>
      <span className="text-rotate-sr-only">{safeTexts[currentTextIndex]}</span>
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.span
          key={currentTextIndex}
          className={cn(splitBy === "lines" ? "text-rotate-lines" : "text-rotate")}
          layout
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex, array) => {
            const previousCharsCount = array
              .slice(0, wordIndex)
              .reduce((sum, word) => sum + word.characters.length, 0);
            const totalChars = array.reduce((sum, word) => sum + word.characters.length, 0);

            return (
              <span key={wordIndex} className={cn("text-rotate-word", splitLevelClassName)}>
                {wordObj.characters.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(previousCharsCount + charIndex, totalChars)
                    }}
                    className={cn("text-rotate-element", elementLevelClassName)}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordObj.needsSpace ? <span className="text-rotate-space"> </span> : null}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
});

export default RotatingText;
