function TextAlignCenterIcon(): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <path d="M 2 4 L 2 6 L 48 6 L 48 4 Z M 9 14 L 9 16 L 41 16 L 41 14 Z M 2 24 L 2 26 L 48 26 L 48 24 Z M 9 34 L 9 36 L 41 36 L 41 34 Z M 2 44 L 2 46 L 48 46 L 48 44 Z"></path>
    </svg>
  );
}

function TextAlignJustifyIcon(): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <path d="M 2 4 L 2 6 L 48 6 L 48 4 Z M 2 14 L 2 16 L 48 16 L 48 14 Z M 2 24 L 2 26 L 48 26 L 48 24 Z M 2 34 L 2 36 L 48 36 L 48 34 Z M 2 44 L 2 46 L 48 46 L 48 44 Z"></path>
    </svg>
  );
}

function TextAlignLeftIcon(): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <path d="M 2 4 L 2 6 L 48 6 L 48 4 Z M 2 14 L 2 16 L 34 16 L 34 14 Z M 2 24 L 2 26 L 48 26 L 48 24 Z M 2 34 L 2 36 L 34 36 L 34 34 Z M 2 44 L 2 46 L 48 46 L 48 44 Z"></path>
    </svg>
  );
}

function TextAlignRightIcon(): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <path d="M 2 4 L 2 6 L 48 6 L 48 4 Z M 16 14 L 16 16 L 48 16 L 48 14 Z M 2 24 L 2 26 L 48 26 L 48 24 Z M 16 34 L 16 36 L 48 36 L 48 34 Z M 2 44 L 2 46 L 48 46 L 48 44 Z"></path>
    </svg>
  );
}

const TextAlignIcon = {
  Center: TextAlignCenterIcon,
  Justify: TextAlignJustifyIcon,
  Left: TextAlignLeftIcon,
  Right: TextAlignRightIcon,
};

export default TextAlignIcon;
