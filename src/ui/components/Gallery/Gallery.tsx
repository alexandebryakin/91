import React from 'react';
import ChevronDownIcon from '../../../icons/ChevronDownIcon';
import ChevronUpIcon from '../../../icons/ChevronUpIcon';
import './Gallery.scss';

export interface IImage {
  src: string;
  alt?: string;
}

interface GalleryProps {
  images: IImage[];
  onClickImage: (img: IImage) => void;
}

function Gallery(props: GalleryProps): React.ReactElement {
  const { images, onClickImage } = props;

  const previewMax = 6;
  const perLine = 3;

  const hasMore = images.length > previewMax;
  const exact = images.length == previewMax;

  const [expanded, setExpanded] = React.useState(false);

  const previewImages = () => {
    if (hasMore && !expanded) return images.slice(0, previewMax - 1);
    return images;
  };

  const blankTiles = (): number => {
    const followingTilesCount = images.length <= previewMax ? 0 : 1;
    const totalTilesCount = images.length + followingTilesCount;
    if (!expanded && totalTilesCount > previewMax) return 0;
    const numOfBlankTilesToReturn = perLine - (totalTilesCount % perLine);
    return numOfBlankTilesToReturn == perLine ? 0 : numOfBlankTilesToReturn;
  };

  return (
    <div className={`gallery`}>
      {previewImages().map((img, idx) => {
        const handleClick = () => {
          onClickImage && onClickImage(img);
        };

        return (
          <div className="gallery__tile gallery__image" key={idx} onClick={handleClick}>
            <img className="" src={img.src} alt="" />
          </div>
        );
      })}

      {!exact && hasMore && expanded && (
        <div className="gallery__tile btn-view-more" onClick={() => setExpanded(false)}>
          <div className="btn-view-more__icon">
            <ChevronUpIcon />
          </div>
          View Less
        </div>
      )}

      {Array.from(new Array(blankTiles())).map((_elem, idx) => (
        <div className="gallery__tile gallery__tile--blank" key={idx} />
      ))}

      {!exact && hasMore && !expanded && (
        <div className="gallery__tile btn-view-more" onClick={() => setExpanded(true)}>
          <div className="btn-view-more__icon">
            <ChevronDownIcon />
          </div>
          View More
        </div>
      )}
    </div>
  );
}

export default Gallery;
