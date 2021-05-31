import { Layer } from 'konva/types/Layer';
import { Stage } from 'konva/types/Stage';

import { Text } from 'konva/types/shapes/Text';
import { Transformer } from 'konva/types/shapes/Transformer';

function makeTextEditible(text: Text, transformer: Transformer, stage: Stage, layer: Layer): void {
  text.on('dblclick dbltap', () => {
    // hide text node and transformer:
    text.hide();
    transformer?.hide();
    layer?.draw();

    // create textarea over canvas with absolute position
    // first we need to find position for textarea
    // how to find it?

    // at first lets find position of text node relative to the stage:
    const textPosition = text.absolutePosition();

    // so position of textarea will be the sum of positions above:
    const areaPosition = {
      x: (stage?.container().offsetLeft || 0) + textPosition.x,
      y: (stage?.container().offsetTop || 0) + textPosition.y,
    };

    // create textarea and style it
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the textarea can be different
    // and sometimes it is hard to make it 100% the same. But we will try...
    textarea.value = text.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = text.width() - text.padding() * 2 + 'px';
    textarea.style.height = text.height() - text.padding() * 2 + 5 + 'px';
    textarea.style.fontSize = text.fontSize() + 'px';
    textarea.style.border = '1px solid gray';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = text.lineHeight().toString();
    textarea.style.fontFamily = text.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = text.align();
    textarea.style.color = text.fill();
    const rotation = text.rotation();
    let transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }

    let px = 0;
    // also we need to slightly move textarea on firefox
    // because it jumps a bit
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      px += 2 + Math.round(text.fontSize() / 20);
    }
    transform += 'translateY(-' + px + 'px)';

    textarea.style.transform = transform;

    // reset height
    textarea.style.height = 'auto';
    // after browsers resized it we can set actual value
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();

    function removeTextarea() {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      text.show();
      transformer?.show();
      transformer?.forceUpdate();
      layer?.draw();
    }

    function setTextareaWidth(newWidth: number) {
      if (!newWidth) {
        // set width for placeholder
        // newWidth = text.placeholder.length * text.fontSize();
        // text.value.length
        newWidth = text.value.length * text.fontSize();
      }
      // some extra fixes on different browsers
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isSafari || isFirefox) {
        newWidth = Math.ceil(newWidth);
      }

      // var isEdge =
      //   document.documentMode || /Edge/.test(navigator.userAgent);
      // if (isEdge) {
      //   newWidth += 1;
      // }
      textarea.style.width = newWidth + 'px';
    }

    textarea.addEventListener('keydown', function (e) {
      // hide on enter
      // but don't hide on shift + enter
      // e.key
      console.warn('The usage of e.keyCode is deprecated ⛔️ (`makeTextEditable`)');
      if (e.keyCode === 13 && !e.shiftKey) {
        text.text(textarea.value);
        removeTextarea();
      }
      // on esc do not set value back to node
      if (e.keyCode === 27) {
        removeTextarea();
      }
    });

    textarea.addEventListener('keydown', function () {
      const scale = text.getAbsoluteScale().x;
      setTextareaWidth(text.width() * scale);
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + text.fontSize() + 'px';
    });

    function handleOutsideClick(this: Window, e: MouseEvent) {
      if (e.target !== textarea) {
        text.text(textarea.value);
        removeTextarea();
      }
    }
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  });
}

export default makeTextEditible;
