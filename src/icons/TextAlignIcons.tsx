function TextAlignCenterIcon(): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
      <path d="M 9.5 10 A 1.50015 1.50015 0 1 0 9.5 13 L 38.5 13 A 1.50015 1.50015 0 1 0 38.5 10 L 9.5 10 z M 5.5 23 A 1.50015 1.50015 0 1 0 5.5 26 L 42.5 26 A 1.50015 1.50015 0 1 0 42.5 23 L 5.5 23 z M 13.5 36 A 1.50015 1.50015 0 1 0 13.5 39 L 34.5 39 A 1.50015 1.50015 0 1 0 34.5 36 L 13.5 36 z"></path>
    </svg>
    //   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
    //     <path d="M 2 4 L 2 6 L 48 6 L 48 4 Z M 9 14 L 9 16 L 41 16 L 41 14 Z M 2 24 L 2 26 L 48 26 L 48 24 Z M 9 34 L 9 36 L 41 36 L 41 34 Z M 2 44 L 2 46 L 48 46 L 48 44 Z"></path>
    //   </svg>
  );
}

function TextAlignJustifyIcon(): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
      <path d="M 5.5 10 A 1.50015 1.50015 0 1 0 5.5 13 L 42.5 13 A 1.50015 1.50015 0 1 0 42.5 10 L 5.5 10 z M 5.5 23 A 1.50015 1.50015 0 1 0 5.5 26 L 42.5 26 A 1.50015 1.50015 0 1 0 42.5 23 L 5.5 23 z M 5.5 36 A 1.50015 1.50015 0 1 0 5.5 39 L 42.5 39 A 1.50015 1.50015 0 1 0 42.5 36 L 5.5 36 z"></path>
    </svg>
    // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
    //   <path d="M 2 4 L 2 6 L 48 6 L 48 4 Z M 2 14 L 2 16 L 48 16 L 48 14 Z M 2 24 L 2 26 L 48 26 L 48 24 Z M 2 34 L 2 36 L 48 36 L 48 34 Z M 2 44 L 2 46 L 48 46 L 48 44 Z"></path>
    // </svg>
  );
}

function TextAlignLeftIcon(): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
      <path d="M 5.5 10 A 1.50015 1.50015 0 1 0 5.5 13 L 34.5 13 A 1.50015 1.50015 0 1 0 34.5 10 L 5.5 10 z M 5.5 23 A 1.50015 1.50015 0 1 0 5.5 26 L 42.5 26 A 1.50015 1.50015 0 1 0 42.5 23 L 5.5 23 z M 6.5 36 A 1.50015 1.50015 0 1 0 6.5 39 L 27.5 39 A 1.50015 1.50015 0 1 0 27.5 36 L 6.5 36 z"></path>
    </svg>
    // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
    //   <path d="M 2 4 L 2 6 L 48 6 L 48 4 Z M 2 14 L 2 16 L 34 16 L 34 14 Z M 2 24 L 2 26 L 48 26 L 48 24 Z M 2 34 L 2 36 L 34 36 L 34 34 Z M 2 44 L 2 46 L 48 46 L 48 44 Z"></path>
    // </svg>
  );
}

function TextAlignRightIcon(): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
      <path d="M 13.5 10 A 1.50015 1.50015 0 1 0 13.5 13 L 42.5 13 A 1.50015 1.50015 0 1 0 42.5 10 L 13.5 10 z M 5.5 23 A 1.50015 1.50015 0 1 0 5.5 26 L 42.5 26 A 1.50015 1.50015 0 1 0 42.5 23 L 5.5 23 z M 20.5 36 A 1.50015 1.50015 0 1 0 20.5 39 L 41.5 39 A 1.50015 1.50015 0 1 0 41.5 36 L 20.5 36 z"></path>
    </svg>
    // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
    //   <path d="M 2 4 L 2 6 L 48 6 L 48 4 Z M 16 14 L 16 16 L 48 16 L 48 14 Z M 2 24 L 2 26 L 48 26 L 48 24 Z M 16 34 L 16 36 L 48 36 L 48 34 Z M 2 44 L 2 46 L 48 46 L 48 44 Z"></path>
    // </svg>
  );
}

const TextAlignIcons = {
  Center: TextAlignCenterIcon,
  Justify: TextAlignJustifyIcon,
  Left: TextAlignLeftIcon,
  Right: TextAlignRightIcon,
};

export default TextAlignIcons;
