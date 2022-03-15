import React from 'react';

function useCliskOutside(refs: any[], onClickOutside: () => void): void {
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isInside = (ref: any): boolean => !ref.current || ref.current.contains(event.target);

      if (refs.some(isInside)) return;

      onClickOutside();
    }

    document.addEventListener('mousedown', handleClickOutside);

    const cleanup = () => document.removeEventListener('mousedown', handleClickOutside);

    return cleanup;
  }, [...refs, onClickOutside.toString()]);
}

export default useCliskOutside;
