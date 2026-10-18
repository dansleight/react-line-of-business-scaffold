type LogoProps = {
  size?: number;
};

export function Logo({ size }: LogoProps) {
  const parts = (
    <g id="logo_1" data-name="layer_1">
      <g>
        <path
          fill="currentColor"
          data-name="part1"
          d="M0,0m2,9h22.66v40h21.32v-30h8v10h21.32v-10h8v30h14.66v8h-14.66v20h-8v-40h-21.32v12h14.66v8h-14.66v30h-8v-30h-21.32v30h-8v-30h-7.33v-8h7.33v-32h-14.66z"
        />
      </g>
    </g>
  );

  if (size)
    return (
      <svg
        id="logo"
        width={size}
        height={size}
        data-name="layer_0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
      >
        {parts}
      </svg>
    );

  return (
    <svg
      id="logo"
      data-name="layer_0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      {parts}
    </svg>
  );
}
