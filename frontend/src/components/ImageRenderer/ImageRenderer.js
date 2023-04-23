import "./ImageRenderer.css";
import React, { useState, useRef } from "react";
import classnames from "classnames";
import { useIntersection } from "src/components/IntersectionObserver";

const ImageRenderer = ({ alt, url, thumb, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  useIntersection(imgRef, () => {
    setIsInView(true);
  });

  const handleOnLoad = () => {
    setIsLoaded(true);
  };

  return (
    // Padding-bottom give us the height
    <div
      className="image-container"
      ref={imgRef}
      style={{ paddingBottom: `${(height / width) * 100}%`, width: "100%" }}
    >
      {isInView && (
        <>
          <img
            className={classnames(
              "image",
              "thumb",
              { isLoaded: !!isLoaded },
              { hidden: !!isLoaded }
            )}
            alt={alt}
            src={thumb}
          />
          <img
            className={classnames("image", {
              isLoaded: !!isLoaded,
            })}
            src={url}
            alt={alt}
            onLoad={handleOnLoad}
          />
        </>
      )}
      {/* {isInView && (
                <>
                    <img className='image' src={url} alt="suite-room-view" />
                </>
            )} */}
    </div>
  );
};

export default ImageRenderer;
