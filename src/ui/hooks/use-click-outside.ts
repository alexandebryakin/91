import React from 'react';

function useCliskOutside(ref: any, onClickOutside: () => void): void {
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target)) return;

      onClickOutside();
    }

    document.addEventListener('mousedown', handleClickOutside);

    const cleanup = () => document.removeEventListener('mousedown', handleClickOutside);

    return cleanup;
  }, [ref, onClickOutside.toString()]);
}

export default useCliskOutside;
