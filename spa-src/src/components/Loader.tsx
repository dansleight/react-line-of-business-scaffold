import React, { useEffect, useRef, useState } from "react";

export const WaitBar: React.FC = () => {
  return (
    <div className="progress mt-3" role="progressbar">
      <div
        className="progress-bar progress-bar-striped progress-bar-animated"
        style={{ width: "100%" }}
      />
    </div>
  );
};

// Define block interface for type safety
interface Block {
  x: number;
  width: number;
  velocity: number;
  mass: number;
  class: string;
}

export const BallsBar: React.FC = () => {
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const blocksRef = useRef<Block[]>([]);
  const requestRef = useRef<number>();

  // SVG dimensions (viewBox units)
  const svgWidth: number = 100;
  const svgHeight: number = 5;
  const trackHeight: number = 600 / (containerWidth * 0.98);
  const padding: number = 1;

  // Initial block properties
  const initialBlocks: Block[] = [
    {
      x: 10,
      width: 3,
      velocity: 0.7,
      mass: 8,
      class: "light-ball",
    },
    {
      x: 30,
      width: 4,
      velocity: -0.2,
      mass: 13,
      class: "heavy-ball",
    },
    {
      x: 60,
      width: 3,
      velocity: 0.6,
      mass: 8,
      class: "light-ball",
    },
  ];

  useEffect(() => {
    const resetContainerWidth = () => {
      if (containerRef.current)
        setContainerWidth(containerRef.current.clientWidth);
    };
    resetContainerWidth();
    window.addEventListener("resize", resetContainerWidth);

    blocksRef.current = [...initialBlocks];

    const updatePhysics = () => {
      const blocks = blocksRef.current;
      const dt: number = 0.016; // Approx 60fps timestep

      // Update positions
      blocks.forEach((block: Block) => {
        block.x += block.velocity * dt * 60; // Scale velocity for smooth movement

        // Wall collisions
        if (block.x < padding) {
          block.x = padding;
          block.velocity = -block.velocity;
        } else if (block.x + block.width > svgWidth - padding) {
          block.x = svgWidth - padding - block.width;
          block.velocity = -block.velocity;
        }
      });

      // Block-block collisions
      for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
          const b1: Block = blocks[i];
          const b2: Block = blocks[j];

          // Check for overlap
          if (b1.x + b1.width > b2.x && b1.x < b2.x + b2.width) {
            // Elastic collision formula
            const m1: number = b1.mass;
            const m2: number = b2.mass;
            const v1: number = b1.velocity;
            const v2: number = b2.velocity;

            b1.velocity = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
            b2.velocity = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);

            // Prevent sticking: adjust positions
            const overlap: number = (b1.x + b1.width - b2.x) / 2;
            b1.x -= overlap;
            b2.x += overlap;
          }
        }
      }

      // Update SVG
      const svg = svgRef.current;
      if (svg) {
        blocks.forEach((block: Block, index: number) => {
          const circ = svg.querySelector(`#block-${index}`);
          if (circ) {
            circ.setAttribute("cx", (block.x + block.width / 2).toString());
          }
        });
      }

      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener("resize", resetContainerWidth);
    };
  }, []);

  return (
    <div
      className="w-full h-12 bg-primary px-2 py-0 rounded-pill balls-bar"
      ref={containerRef}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Track */}
        <rect
          x={padding}
          y={(svgHeight - trackHeight) / 2}
          width={svgWidth - 2 * padding}
          height={trackHeight}
          fill="#D1D5DB" // Gray-300
        />
        {/* Blocks */}
        {initialBlocks.map((block: Block, index: number) => (
          <circle
            key={index}
            id={`block-${index}`}
            cx={block.x}
            cy={svgHeight / 2}
            r={block.width / 2}
            className={block.class}
          />
        ))}
      </svg>
    </div>
  );
};
