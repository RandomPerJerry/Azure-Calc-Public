import { useState, useEffect, useCallback } from 'react';

const useImagePreloader = (imageData) => {
  const [preloadedImages, setPreloadedImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSingleImage = useCallback(async (item) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => ({
          ...prev,
          [item.name]: img
        }));
        resolve(img);
      };
      img.onerror = () => reject(`Failed to load image: ${item.name}`);
      img.src = item.imageUrl;
    });
  }, []);

  // Initial load of all images
  useEffect(() => {
    if (!imageData?.length) return;

    const loadImages = async () => {
      setIsLoading(true);
      const images = {};
      const loadPromises = imageData.map(item => {
        return loadSingleImage(item)
          .then(img => {
            images[item.name] = img;
          })
          .catch(error => {
            console.error(error);
            return null;
          });
      });

      try {
        await Promise.all(loadPromises);
        setPreloadedImages(prev => ({...prev, ...images}));
        setError(null);
      } catch (error) {
        console.error('Error preloading images:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [imageData, loadSingleImage]);

  // Function to retry loading a specific image
  const reloadImage = useCallback(async (item) => {
    if (!item) return;
    try {
      await loadSingleImage(item);
    } catch (error) {
      console.error('Error reloading image:', error);
    }
  }, [loadSingleImage]);

  return { preloadedImages, isLoading, error, reloadImage };
};

export default useImagePreloader;