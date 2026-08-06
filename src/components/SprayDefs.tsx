/**
 * SVG filter definitions, mounted once for the whole site.
 *
 * Two effects do most of the visual work:
 *
 * `spray-edge` displaces a shape with fractal noise and softens it, so a
 * clean vector path comes out with the ragged, slightly-off-register edge a
 * real can leaves, then punches fine speckle through it for overspray.
 *
 * `boil` is the same displacement idea applied to line art, but with its noise
 * seed stepping a few times a second. Hand-drawn animation redraws every frame,
 * so the lines never sit perfectly still — this reproduces that from a single
 * drawing, which is why the illustrations feel drawn rather than placed.
 */
export function SprayDefs() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter
          id="spray-edge"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="4"
            seed="9"
            result="warp"
          />
          {/* The mark stays fully opaque. An earlier version masked it with
              high-frequency noise for overspray texture, which looked correct
              in isolation but averaged out to pale pink at real sizes — paint
              has to read as paint first. Texture belongs in the halo below,
              behind the mark, not punched through it. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="11"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feGaussianBlur in="rough" stdDeviation="0.7" />
        </filter>

        {/* Soft halo for sprayed blobs — the cloud that lands around the mark. */}
        <filter
          id="spray-mist"
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="11" result="soft" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="1"
            seed="12"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 -0.9 0.85"
            result="grainAlpha"
          />
          <feComposite in="soft" in2="grainAlpha" operator="in" />
        </filter>

        <filter
          id="boil"
          x="-12%"
          y="-12%"
          width="124%"
          height="124%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022"
            numOctaves="2"
            seed="2"
            result="wobble"
          >
            {/* Discrete steps, not a smooth tween — hand-drawn frames cut, they
                do not interpolate. Roughly 7fps, the classic rough-loop rate. */}
            <animate
              attributeName="seed"
              values="2;7;13"
              dur="0.42s"
              calcMode="discrete"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="wobble"
            scale="4.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
