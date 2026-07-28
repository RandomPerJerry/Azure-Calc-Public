function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 == null || obj2 == null) {
    return false;
  }

  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }

  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    return false;
  }

  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (
      !keys2.includes(key) ||
      !deepEqual(obj1[key], obj2[key])
    ) {
      return false;
    }
  }

  return true;
}

// New lenient comparison function
function lenientDeepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 == null || obj2 == null) {
    return false;
  }

  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false;
  }

  // Handle arrays specifically - DON'T compare length
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    // Compare only common indices
    const maxLength = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLength; i++) {
      const val1 = i < obj1.length ? obj1[i] : undefined;
      const val2 = i < obj2.length ? obj2[i] : undefined;
      
      if (!lenientDeepEqual(val1, val2)) {
        return false;
      }
    }
    return true;
  }

  // If one is array and other is not
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    return false;
  }

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
  // Filter out updatedAt and version
  const keysToCompare = [...allKeys].filter(key => 
    key !== 'updatedAt' && key !== 'version'
  );

  for (let key of keysToCompare) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    
    // If both are undefined or missing, they're equal
    if (val1 === undefined && val2 === undefined) {
      continue;
    }
    
    // If one has the property but it's undefined, and the other doesn't have it
    // they're still considered equal
    if ((val1 === undefined && !(key in obj2)) || 
        (val2 === undefined && !(key in obj1))) {
      continue;
    }
    
    if (!lenientDeepEqual(val1, val2)) {
      return false;
    }
  }

  return true;
}

export default deepEqual;
export { lenientDeepEqual };
