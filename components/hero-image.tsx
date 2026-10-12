import React from 'react';

/**
 * HeroImage – a static full‑width hero banner.
 *
 * The component expects an image at `/hero.jpg` (placed in the `public/`
 * directory). It renders the image as a background with a dark overlay and a
 * centered headline. Replace the placeholder image with a real high‑resolution
 * banner that matches your branding.
 */
export const HeroImage: React.FC = () => {
  return (
    <section
      className="relative w-full h-[60vh] bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/hero.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">
          YOUR CAMPUS, IN MOTION
        </h1>
      </div>
    </section>
  );
};
