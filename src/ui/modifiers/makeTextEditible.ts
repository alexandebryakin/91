import { Layer } from 'konva/types/Layer';
import { Stage } from 'konva/types/Stage';
import anime from 'animejs';

import { Image } from 'konva/types/shapes/Image';
import { Transformer } from 'konva/types/shapes/Transformer';
import { IEditorController } from '../components/RichTextEditor/RichTextEditor';
import Template from '../template';

function makeTextEditible(
  textAsImage: Image,
  transformer: Transformer,
  stage: Stage,
  layer: Layer,
  editorController: IEditorController,
): void {
  textAsImage.on('dblclick dbltap', () => {
    const scalePrev = { ...stage.scale() };
    const scaleCurrent = { ...scalePrev };
    const scaleFinal = { x: 1, y: 1 };
    anime({
      targets: scaleCurrent,
      ...scaleFinal,
      easing: 'easeOutQuint',
      duration: 500,
      update: () => {
        stage.scale(scaleCurrent);
      },
      complete: () => {
        textAsImage.hide();
        transformer?.hide();
        layer?.draw();

        const textPosition = textAsImage.absolutePosition();

        const areaPosition = {
          x: (stage?.container().offsetLeft || 0) + textPosition.x,
          // y: (stage?.container().offsetTop || 0) + textPosition.y,
          y: textPosition.y,
        };

        editorController.x(areaPosition.x);
        editorController.y(areaPosition.y);
        editorController.width(textAsImage.width());
        editorController.height(textAsImage.height());
        editorController.visible(true);
      },
    });

    function removeDraftJs() {
      editorController.visible(false);
      const scaleCurrent = { ...stage.scale() };
      console.log(scalePrev, scaleCurrent);
      anime({
        targets: scaleCurrent,
        ...scalePrev,
        easing: 'easeOutQuint',
        duration: 2000,
        update: () => {
          stage.scale(scaleCurrent);
        },
      });

      const element = editorController.editorContainerRef.current;

      Template.transformTextAsImage(element).then((canvas) => {
        textAsImage.image(canvas);
        layer.draw();
      });

      textAsImage.show();
      textAsImage.width(editorController.values.width());
      textAsImage.height(editorController.values.height());
      transformer?.show();
      transformer?.forceUpdate();
      layer?.draw();
    }

    editorController.onClickOutside(removeDraftJs);
  });
}

export default makeTextEditible;
