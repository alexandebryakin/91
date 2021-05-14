import Konva from 'konva';
import { Layer } from 'konva/types/Layer';
import { Stage } from 'konva/types/Stage';
import React from 'react';
import './App.scss';
import LabeledInput from './ui/components/LabeledInput';
import NavBar from './ui/components/NavBar';

function SideBar(): React.ReactElement {
  return (
    <div className="sidebar__container">
      <div className="sidebar">
        <div className="menu">Document structure</div>
      </div>
    </div>
  );
}

function App(): React.ReactElement {
  const konvaStageRef = React.useRef<HTMLDivElement>(null);
  const konvaStageContainer = 'konva-stage-container';
  React.useEffect(() => {
    const width = konvaStageRef.current?.offsetWidth;
    const height = konvaStageRef.current?.offsetHeight;

    const stage = new Konva.Stage({
      container: konvaStageContainer,
      width: width,
      height: height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const text = new Konva.Text({
      x: 50,
      y: 60,
      fontSize: 20,
      text: 'Hello from the Konva framework. Try to resize me.',
      draggable: true,
    });
    layer.add(text);

    const MIN_WIDTH = 20;
    const tr = new Konva.Transformer({
      nodes: [text],
      padding: 5,
      // enable only side anchors
      enabledAnchors: ['middle-left', 'middle-right'],
      // limit transformer size
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < MIN_WIDTH) {
          return oldBox;
        }
        return newBox;
      },
    });
    layer.add(tr);
    layer.draw();

    stage.on('dragmove', function (e) {
      const { x, y } = e.target.attrs;
      setCoords(() => ({ x: Math.round(x), y: Math.round(y) }));
    });

    text.on('transform', function () {
      setSize(() => {
        return {
          width: Math.round(text.width()),
          height: Math.round(text.height()),
        };
      });
      // const lines = [
      //   'x: ' + text.x(),
      //   'y: ' + text.y(),
      //   'rotation: ' + text.rotation(),
      //   'width: ' + text.width(),
      //   'height: ' + text.height(),
      //   'scaleX: ' + text.scaleX(),
      //   'scaleY: ' + text.scaleY(),
      // ];
      // console.log(lines);
    });

    text.on('transform', () => {
      // with enabled anchors we can only change scaleX
      // so we don't need to reset height
      // just width
      text.setAttrs({
        width: Math.max(text.width() * text.scaleX(), MIN_WIDTH),
        scaleX: 1,
        scaleY: 1,
      });
    });

    // >>> try
    function madeTextEditible() {
      text.on('dblclick dbltap', () => {
        // hide text node and transformer:
        text.hide();
        tr.hide();
        layer.draw();

        // create textarea over canvas with absolute position
        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        const textPosition = text.absolutePosition();

        // so position of textarea will be the sum of positions above:
        const areaPosition = {
          x: stage.container().offsetLeft + textPosition.x,
          y: stage.container().offsetTop + textPosition.y,
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
          tr.show();
          tr.forceUpdate();
          layer.draw();
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
          console.log('🚀 ~ file: App.tsx ~ line 212 ~ e.key', e.key);
          if (e.keyCode === 13 && !e.shiftKey) {
            text.text(textarea.value);
            removeTextarea();
          }
          // on esc do not set value back to node
          if (e.keyCode === 27) {
            removeTextarea();
          }
        });

        textarea.addEventListener('keydown', function (e) {
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

    madeTextEditible();

    setStage(stage);
    setLayer(layer);
    // setTransformer(tr);
  }, []);

  const [stage, setStage] = React.useState<Stage>();
  const [layer, setLayer] = React.useState<Layer>();
  const [transformer, setTransformer] = React.useState<Transformer>();

  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  // console.log(stage);
  const onClickTextTool = () => {
    const text = new Konva.Text({
      x: 50,
      y: 60,
      fontSize: 20,
      text: 'Hello from the Konva framework. Try to resize me.',
      draggable: true,
    });
    console.log('🚀 ~ file: App.tsx ~ line 278 ~ onClickTextTool ~ text', text);

    let selected = false;
    const textTransformer = new Konva.Transformer({
      nodes: [],
      padding: 5,
      // enable only side anchors
      enabledAnchors: ['middle-left', 'middle-right'],
      // limit transformer size
      boundBoxFunc: (oldBox, newBox) => {
        const MIN_WIDTH = 20;

        if (newBox.width < MIN_WIDTH) {
          return oldBox;
        }
        return newBox;
      },
    });
    layer?.add(textTransformer);
    text.on('click', (e) => {
      if (selected) {
        textTransformer.nodes([]);
      } else {
        textTransformer.nodes([text]);
        // selected = !selected;
      }
      selected = !selected;

      layer?.draw();
    });
    layer?.add(text);
    stage?.batchDraw();
  };

  return (
    <>
      <NavBar />

      <div className="main">
        <div className="page">
          <SideBar />

          <div className="builder-main">
            <div id={konvaStageContainer} ref={konvaStageRef}></div>
          </div>

          <div className="toolbar">
            <div className="toolbar__group">
              <div className="tool">A</div>
              <div className="tool">B</div>
            </div>

            <div className="separator" />

            <div className="toolbar__group">
              <div className="tool tool--active" onClick={onClickTextTool}>
                T
              </div>
            </div>

            <div className="separator" />
          </div>

          <div className="builder-controls">
            <div className="controls-section">
              <div className="controls-section__row">
                <LabeledInput label="X" value={(coords.x || '').toString()} />

                <div className="controls-section__separator">A</div>

                <LabeledInput label="Y" value={(coords.y || '').toString()} />
              </div>

              <div className="controls-section__row">
                <LabeledInput label="W" value={(size.width || '').toString()} />

                <div className="controls-section__separator">A</div>

                <LabeledInput label="H" value={(size.height || '').toString()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
