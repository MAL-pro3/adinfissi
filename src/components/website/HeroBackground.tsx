import { useEffect, useState } from 'react';

interface HeroBackgroundProps {
  images: string[];
  overlay?: string;
  intervalMs?: number;
}

/**
 * Sfondo della hero. Se riceve più immagini le mostra come slideshow con
 * dissolvenza automatica; con una sola immagine resta statico.
 */
export default function HeroBackground({
  images,
  overlay = 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
  intervalMs = 6000,
}: HeroBackgroundProps) {
  const valid = images.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (valid.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % valid.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [valid.length, intervalMs]);

  useEffect(() => {
    if (index >= valid.length) setIndex(0);
  }, [valid.length, index]);

  if (valid.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {valid.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${url})`, opacity: i === index ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0" style={{ backgroundImage: overlay }} />
    </div>
  );
}
