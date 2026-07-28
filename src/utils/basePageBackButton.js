const defaultState = {
  currentScreen: "loadProfile",
  systemType: "",
  isEditingSystem: false,
  editingSystemId: "",
  workingConditionRoute: "",
  workingConditionPoint: "",
  isEditingCondition: false,
};

const handleBackNavigationState = (currentUrlState) => {


  switch (currentUrlState.currentScreen) {
    case "loadProfile":
      return null

    case "busBar":
      return defaultState;

    case "system":
      if (currentUrlState.systemType) {
        if (currentUrlState.isEditingSystem) {
          return {
            currentScreen: "system",
            systemType: currentUrlState.systemType,
            isEditingSystem: false,
            editingSystemId: "",
            workingConditionRoute: "",
            workingConditionPoint: "",
            isEditingCondition: false,
          };
        }
        return {
          currentScreen: "system",
          systemType: "",
          isEditingSystem: false,
          editingSystemId: "",
          workingConditionRoute: "",
          workingConditionPoint: "",
          isEditingCondition: false,
        };
      }

      return defaultState;

    case "workingCondition":
      if (
        currentUrlState.workingConditionRoute &&
        currentUrlState.workingConditionPoint &&
        currentUrlState.isEditingCondition
      ) {
        return {
          currentScreen: "workingCondition",
          systemType: "",
          isEditingSystem: false,
          editingSystemId: "",
          workingConditionRoute: "",
          workingConditionPoint: "",
          isEditingCondition: false,
        };
      }

      return defaultState;

    default:
      return defaultState;
  }
};

export default handleBackNavigationState
