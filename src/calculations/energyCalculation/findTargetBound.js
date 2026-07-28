function findDataBounds(sortedArray, target) {
  if (target <= sortedArray[0]) {
    return { lowerIndex: null, upperIndex: 0 };
  }
  if (target >= sortedArray[sortedArray.length - 1]) {
    return { lowerIndex: sortedArray.length - 1, upperIndex: null };
  }

  let left = 0;
  let right = sortedArray.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const currentValue = sortedArray[mid];

    if (currentValue === target) {
      return { lowerIndex: mid, upperIndex: mid };
    }

    if (currentValue < target) {
      if (mid + 1 < sortedArray.length && sortedArray[mid + 1] > target) {
        return { lowerIndex: mid, upperIndex: mid + 1 };
      }
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return null;
}

export default findDataBounds;