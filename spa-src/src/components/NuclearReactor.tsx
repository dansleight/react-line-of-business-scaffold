import React, { useState, useEffect, useRef } from "react";

const CHAMBER_WIDTH = 600;
const CHAMBER_HEIGHT = 200;
const CHAMBER_X = 10;
const CHAMBER_Y = 10;
const CONTROL_ROD_WIDTH = 20;
const MIN_ANGLE_OFFSET = Math.PI / 18; // 10 degrees in radians

interface Photon {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  absorbed: boolean;
  absorbedTime?: number;
}

interface NuclearReactorProps {
  minVelocity?: number;
  maxVelocity?: number;
  startingPhotons?: number;
  generationRate?: number;
  controlRodPosition?: number;
  coolColorStart?: string;
  coolColorEnd?: string;
  hotColorStart?: string;
  hotColorEnd?: string;
}

const NuclearReactor: React.FC<NuclearReactorProps> = ({
  minVelocity = 100,
  maxVelocity = 400,
  startingPhotons = 10,
  generationRate = 60,
  controlRodPosition = 50,
  coolColorStart = "#87CEEB", // Sky blue
  coolColorEnd = "#4682B4", // Steel blue
  hotColorStart = "#FF6347", // Tomato
  hotColorEnd = "#DC143C", // Crimson
}) => {
  const [photons, setPhotons] = useState<Photon[]>([]);
  const [smoothedHeatLevel, setSmoothedHeatLevel] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const photonIdRef = useRef<number>(startingPhotons);

  // Generate a photon with angle constraint
  const generatePhoton = (): Photon => {
    const speed = minVelocity + Math.random() * (maxVelocity - minVelocity);
    let angle = Math.random() * 2 * Math.PI;
    const forbiddenZones = [
      [0, MIN_ANGLE_OFFSET],
      [Math.PI / 2 - MIN_ANGLE_OFFSET, Math.PI / 2 + MIN_ANGLE_OFFSET],
      [Math.PI - MIN_ANGLE_OFFSET, Math.PI + MIN_ANGLE_OFFSET],
      [
        (3 * Math.PI) / 2 - MIN_ANGLE_OFFSET,
        (3 * Math.PI) / 2 + MIN_ANGLE_OFFSET,
      ],
    ];
    for (const [min, max] of forbiddenZones) {
      if (angle >= min && angle <= max) {
        angle =
          Math.random() < 0.5 ? min - MIN_ANGLE_OFFSET : max + MIN_ANGLE_OFFSET;
        if (angle < 0) angle += 2 * Math.PI;
        if (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        break;
      }
    }
    return {
      id: photonIdRef.current++,
      x: Math.random() * (CHAMBER_WIDTH - 20) + CHAMBER_X,
      y: Math.random() * (CHAMBER_HEIGHT - 20) + CHAMBER_Y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      absorbed: false,
    };
  };

  // Initialize photons
  useEffect(() => {
    const initialPhotons = Array.from({ length: startingPhotons }, () =>
      generatePhoton(),
    );
    setPhotons(initialPhotons);
  }, [startingPhotons, minVelocity, maxVelocity]);

  // Photon generation loop
  useEffect(() => {
    const interval = setInterval(
      () => {
        setPhotons((prevPhotons) => [...prevPhotons, generatePhoton()]);
      },
      (60 * 1000) / generationRate,
    );

    return () => clearInterval(interval);
  }, [generationRate]);

  // Animation, cleanup, and heat smoothing
  useEffect(() => {
    const animate = (time: number) => {
      // Recalculate control rod dimensions dynamically
      const CONTROL_ROD_HEIGHT = (controlRodPosition / 100) * CHAMBER_HEIGHT;
      const CONTROL_ROD_X = CHAMBER_X + (CHAMBER_WIDTH - CONTROL_ROD_WIDTH) / 2;
      const CONTROL_ROD_Y = CHAMBER_Y;

      setPhotons((prevPhotons) =>
        prevPhotons
          .map((photon) => {
            if (photon.absorbed) {
              if (photon.absorbedTime && time - photon.absorbedTime > 500) {
                return null;
              }
              return photon;
            }

            const timeStep = 1 / 60;
            let newX = photon.x + photon.vx * timeStep;
            let newY = photon.y + photon.vy * timeStep;
            let newVx = photon.vx;
            let newVy = photon.vy;

            if (newX < CHAMBER_X) {
              newX = CHAMBER_X;
              newVx = -newVx;
            } else if (newX > CHAMBER_X + CHAMBER_WIDTH) {
              newX = CHAMBER_X + CHAMBER_WIDTH;
              newVx = -newVx;
            }
            if (newY < CHAMBER_Y) {
              newY = CHAMBER_Y;
              newVy = -newVy;
            } else if (newY > CHAMBER_Y + CHAMBER_HEIGHT) {
              newY = CHAMBER_Y + CHAMBER_HEIGHT;
              newVy = -newVy;
            }

            const inControlRodX =
              newX >= CONTROL_ROD_X &&
              newX <= CONTROL_ROD_X + CONTROL_ROD_WIDTH;
            const inControlRodY =
              newY >= CONTROL_ROD_Y &&
              newY <= CONTROL_ROD_Y + CONTROL_ROD_HEIGHT;
            const absorbed = inControlRodX && inControlRodY;

            return {
              ...photon,
              x: newX,
              y: newY,
              vx: newVx,
              vy: newVy,
              absorbed,
              absorbedTime: absorbed ? time : photon.absorbedTime,
            };
          })
          .filter((photon): photon is Photon => photon !== null),
      );

      // Calculate raw heat level (tuned for more sensitivity)
      const activePhotons = photons.filter((p) => !p.absorbed).length;
      const totalSpeed = photons
        .filter((p) => !p.absorbed)
        .reduce((sum, p) => sum + Math.sqrt(p.vx * p.vx + p.vy * p.vy), 0);
      const rawHeatLevel = Math.min((activePhotons * totalSpeed) / 20000, 1); // Lower divisor

      // Smooth the heat level
      setSmoothedHeatLevel((prev) => prev + (rawHeatLevel - prev) * 0.1); // Faster easing

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [controlRodPosition, photons]); // Add controlRodPosition as dependency

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Interpolate colors
  const coolStart = hexToRgb(coolColorStart);
  const coolEnd = hexToRgb(coolColorEnd);
  const hotStart = hexToRgb(hotColorStart);
  const hotEnd = hexToRgb(hotColorEnd);

  const startColor = {
    r: Math.round(coolStart.r + (hotStart.r - coolStart.r) * smoothedHeatLevel),
    g: Math.round(coolStart.g + (hotStart.g - coolStart.g) * smoothedHeatLevel),
    b: Math.round(coolStart.b + (hotStart.b - coolStart.b) * smoothedHeatLevel),
  };
  const endColor = {
    r: Math.round(coolEnd.r + (hotEnd.r - coolEnd.r) * smoothedHeatLevel),
    g: Math.round(coolEnd.g + (hotEnd.g - coolEnd.g) * smoothedHeatLevel),
    b: Math.round(coolEnd.b + (hotEnd.b - coolEnd.b) * smoothedHeatLevel),
  };

  return (
    <svg width="620" height="220" xmlns="http://www.w3.org/2000/svg">
      <rect
        x={CHAMBER_X}
        y={CHAMBER_Y}
        width={CHAMBER_WIDTH}
        height={CHAMBER_HEIGHT}
        fill="url(#chamberGradient)"
        stroke="gray"
        strokeWidth="2"
      />
      <defs>
        <linearGradient
          id="chamberGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            style={{
              stopColor: `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: `rgb(${endColor.r}, ${endColor.g}, ${endColor.b})`,
            }}
          />
        </linearGradient>
      </defs>

      <rect
        x={CHAMBER_X + (CHAMBER_WIDTH - CONTROL_ROD_WIDTH) / 2}
        y={CHAMBER_Y}
        width={CONTROL_ROD_WIDTH}
        height={(controlRodPosition / 100) * CHAMBER_HEIGHT}
        fill="black"
      />

      {photons.map((photon) => (
        <circle
          key={photon.id}
          cx={photon.x}
          cy={photon.y}
          r="5"
          fill="yellow"
          opacity={photon.absorbed ? 0 : 1}
        >
          {photon.absorbed && (
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              dur="0.5s"
              fill="freeze"
            />
          )}
        </circle>
      ))}
    </svg>
  );
};

export default NuclearReactor;
