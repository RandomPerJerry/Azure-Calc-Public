/**
 * Updates target object with values from source object, but only for truthy values
 * Handles null objects gracefully by returning the target unchanged
 * 
 * @param {Object} target - The target object to update
 * @param {Object} source - The source object to merge values from
 * @returns {Object} - New object with merged values
 */
const updateWithTruthyValues = (target, source) => {
  // Handle null or undefined source
  if (!source || typeof source !== 'object') {
    return target;
  }

  // Handle null or undefined target
  if (!target || typeof target !== 'object') {
    return source;
  }

  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      
      // Only update if the source value is truthy (not empty string, null, undefined, false, 0)
      // Exception: keep 0 as it might be a valid number
      if (sourceValue !== null && sourceValue !== undefined && sourceValue !== '' && sourceValue !== false) {
        result[key] = sourceValue;
      } else if (sourceValue === 0) {
        // Keep 0 values as they are valid numbers
        result[key] = sourceValue;
      }
    }
  }
  
  return result;
};

export default updateWithTruthyValues;