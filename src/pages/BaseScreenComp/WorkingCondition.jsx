import React, { useEffect, useState } from "react";
import useShipComponent from "../../hooks/useShipComponent";
import { useUrlNavigation } from "../../hooks/useUrlNavigation";
import PowerDistribution from "./workingConditionComponents/powerDistribution/distributionDiagram"; // ← Import directly
import EnergyConsumptionGraph from "../../components/EnergyGraphs/energyConsumptionGraph";
import { syncDataPointSystems } from "../../hooks/useSyncWorkingConitions";

function WorkingCondition() {
  const { shipData, updateComponentState } = useShipComponent();
  const { urlState, updateUrl } = useUrlNavigation();

  const { routes = [] } = shipData.workingConditions || {};
  const maxBarNumber = shipData?.busBar?.dcLinkNumber || 1;
  const [error, setError] = useState("");
  // Remove dataPointErrors state since errors are now in data points
  // const [dataPointErrors, setDataPointErrors] = useState({});

  const editingState = {
    isEditing: urlState.isEditingCondition,
    routeIndex: urlState.workingConditionRoute
      ? parseInt(urlState.workingConditionRoute)
      : null,
    pointIndex: urlState.workingConditionPoint
      ? parseInt(urlState.workingConditionPoint)
      : null,
  };

  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  useEffect(() => {
    if (routes.length !== 0) return;
    handleAddRoute();
  }, [routes]);

  useEffect(() => {
    if (
      urlState.isEditingCondition &&
      urlState.workingConditionRoute &&
      urlState.workingConditionPoint
    ) {
      const routeIndex = parseInt(urlState.workingConditionRoute);
      const pointIndex = parseInt(urlState.workingConditionPoint);

      if (routes[routeIndex]?.workingConditionDataPoints[pointIndex]) {
        console.log(
          `Initializing edit for route ${routeIndex}, point ${pointIndex}`
        );
      } else {
        console.log("route/points does not exist");
        cancelEditing();
      }
    }
  }, [
    urlState.isEditingCondition,
    urlState.workingConditionRoute,
    urlState.workingConditionPoint,
    routes,
  ]);

  const setState = (newState) => {
    updateComponentState("workingConditions", newState);
  };

  const handleAddRoute = () => {
    const tempPoint = { data: {} };
    const syncedPoint = syncDataPointSystems(
      tempPoint,
      shipData.system,
      maxBarNumber
    );

    const newWorkingCondition = {
      routeName: "",
      workingConditionDataPoints: [
        {
          condition: "",
          velocity: "",
          time: "",
          data: syncedPoint.data,
          output: {
            errors: [],
            batterySOC: 100,
            dieselSOC: 100,
            distanceTraveled: 0,
          },
        },
      ],
    };

    setState({
      routes: [...routes, newWorkingCondition],
    });

    console.log("✅ Added new route with default system data");
  };

  const handleRouteNameChange = (index, value) => {
    const newRoutes = [...routes];
    newRoutes[index].routeName = value;
    setState({ routes: newRoutes });
  };

  const handleAddDataPoint = (routeIndex) => {
    const newRoutes = [...routes];
    const currentRoute = newRoutes[routeIndex];
    const existingPoints = currentRoute.workingConditionDataPoints;

    const previousPointData =
      existingPoints.length > 0
        ? existingPoints[existingPoints.length - 1].data
        : null;

    let newPointData = {};

    if (previousPointData) {
      newPointData = JSON.parse(JSON.stringify(previousPointData));
      const tempPoint = { data: newPointData };
      const syncedPoint = syncDataPointSystems(
        tempPoint,
        shipData.system,
        maxBarNumber
      );
      newPointData = syncedPoint.data;
    } else {
      const tempPoint = { data: {} };
      const syncedPoint = syncDataPointSystems(
        tempPoint,
        shipData.system,
        maxBarNumber
      );
      newPointData = syncedPoint.data;
    }

    const newDataPoint = {
      condition: "",
      velocity: "",
      time: "",
      data: newPointData,
      output: {
        errors: [],
        batterySOC: 100,
        dieselSOC: 100,
        distanceTraveled: 0,
      },
    };

    newRoutes[routeIndex].workingConditionDataPoints = [
      ...existingPoints,
      newDataPoint,
    ];

    setState({ routes: newRoutes });
  };

  const handleChangeDataPoint = (routeIndex, pointIndex, field, value) => {
    const newRoutes = [...routes];
    newRoutes[routeIndex].workingConditionDataPoints[pointIndex][field] =
      field === "data" || field === "condition"
        ? value
        : value === ""
        ? ""
        : Number(value);
    setState({ routes: newRoutes });
  };

  const handleDeleteDataPoint = (routeIndex, pointIndex) => {
    if (
      editingState.isEditing &&
      editingState.routeIndex === routeIndex &&
      editingState.pointIndex === pointIndex
    ) {
      cancelEditing();
    }

    const newRoutes = [...routes];
    newRoutes[routeIndex].workingConditionDataPoints = newRoutes[
      routeIndex
    ].workingConditionDataPoints.filter((_, i) => i !== pointIndex);
    setState({ routes: newRoutes });
  };

  const handleDeleteRoute = (routeIndex) => {
    if (routes.length <= 1) {
      setError("At least one route is required");
      return;
    }

    if (editingState.isEditing && editingState.routeIndex === routeIndex) {
      cancelEditing();
    }

    const newRoutes = routes.filter((_, index) => index !== routeIndex);
    setState({ routes: newRoutes });

    if (activeRouteIndex === routeIndex) {
      setActiveRouteIndex(0);
    } else if (activeRouteIndex > routeIndex) {
      setActiveRouteIndex(activeRouteIndex - 1);
    }
  };

  const handleWorkingConditionEdit = (routeIndex, pointIndex) => {
    console.log(`Starting edit for route ${routeIndex}, point ${pointIndex}`);

    updateUrl({
      ...urlState,
      isEditingCondition: true,
      workingConditionRoute: routeIndex.toString(),
      workingConditionPoint: pointIndex.toString(),
    });
  };

  const handleConditionUpdate = (data) => {
    if (
      editingState.isEditing &&
      editingState.routeIndex !== null &&
      editingState.pointIndex !== null
    ) {
      handleChangeDataPoint(
        editingState.routeIndex,
        editingState.pointIndex,
        "data",
        data
      );
    }
  };

  const cancelEditing = () => {
    updateUrl({
      ...urlState,
      isEditingCondition: false,
      workingConditionRoute: "",
      workingConditionPoint: "",
    });
  };

  // Updated function to get errors from the output property
  const getPointErrors = (routeIndex, pointIndex) => {
    const dataPoint =
      routes[routeIndex]?.workingConditionDataPoints[pointIndex];
    return dataPoint?.output?.errors || [];
  };

  // New function to get calculated output data
  const getPointOutput = (routeIndex, pointIndex) => {
    const dataPoint =
      routes[routeIndex]?.workingConditionDataPoints[pointIndex];
    return dataPoint?.output || null;
  };

  const switchRoute = (index) => {
    setActiveRouteIndex(index);
  };

  const currentDataPoint =
    editingState.routeIndex !== null && editingState.pointIndex !== null
      ? routes[editingState.routeIndex]?.workingConditionDataPoints[
          editingState.pointIndex
        ]?.data
      : null;

  // Render the route tabs
  const renderRouteTabs = () => {
    return (
      <div className="route-tabs" style={{ "--button-count": routes.length }}>
        {routes.map((route, index) => (
          <button
            key={index}
            type="button"
            className={index === activeRouteIndex ? "active" : ""}
            onClick={() => switchRoute(index)}
          >
            {route.routeName || `Route ${index + 1}`}
          </button>
        ))}
      </div>
    );
  };

  // Render the data points for the active route
  const renderActiveRouteDataPoints = () => {
    if (!routes[activeRouteIndex]) return null;

    const activeRoute = routes[activeRouteIndex];

    return (
      <div className="input-field">
        <div>
          <label htmlFor={`route-name-${activeRouteIndex}`}>
            Route Description
          </label>
          <div>
            <input
              type="text"
              id={`route-name-${activeRouteIndex}`}
              value={activeRoute.routeName}
              onChange={(e) =>
                handleRouteNameChange(activeRouteIndex, e.target.value)
              }
              placeholder="Enter route description"
            />
          </div>
        </div>

        <div className="full-datapoint">
          {activeRoute.workingConditionDataPoints.map((point, pointIndex) => {
            const pointErrors = getPointErrors(activeRouteIndex, pointIndex);
            const pointOutput = getPointOutput(activeRouteIndex, pointIndex);

            return (
              <div key={pointIndex} className="data-point">
                <div className="data-point-input">
                  <label>Condition</label>
                  <label>Velocity(kts)</label>
                  <label>Time(hour)</label>

                  <input
                    type="text"
                    value={point.condition}
                    onChange={(e) =>
                      handleChangeDataPoint(
                        activeRouteIndex,
                        pointIndex,
                        "condition",
                        e.target.value
                      )
                    }
                    placeholder="#"
                  />
                  <input
                    type="number"
                    value={point.velocity}
                    onChange={(e) =>
                      handleChangeDataPoint(
                        activeRouteIndex,
                        pointIndex,
                        "velocity",
                        e.target.value
                      )
                    }
                    placeholder="0"
                  />
                  <input
                    type="number"
                    value={point.time}
                    onChange={(e) =>
                      handleChangeDataPoint(
                        activeRouteIndex,
                        pointIndex,
                        "time",
                        e.target.value
                      )
                    }
                    placeholder="0"
                  />
                </div>

                <div className="edit-tools">
                  {pointIndex ===
                    activeRoute.workingConditionDataPoints.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleAddDataPoint(activeRouteIndex)}
                      title="Add data point"
                    >
                      +
                    </button>
                  )}
                  {activeRoute.workingConditionDataPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteDataPoint(activeRouteIndex, pointIndex)
                      }
                      title="Remove data point"
                    >
                      −
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleWorkingConditionEdit(activeRouteIndex, pointIndex)
                    }
                    title="Edit condition settings"
                  >
                    ⚙️
                  </button>
                </div>

                {/* Display errors */}
                {pointErrors.length > 0 && (
                  <div className="error-display">
                    {pointErrors.map((error, errorIndex) => (
                      <div key={errorIndex} className="error-item">
                        <span>
                          <strong>{error.code}:</strong> {error.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="form-action">
          <button type="button" onClick={handleAddRoute}>
            Add New Route
          </button>

          {routes.length > 1 && (
            <button
              type="button"
              onClick={() => handleDeleteRoute(activeRouteIndex)}
            >
              Delete Route
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="working-condition">
      <div className="working-condition-data-points">
        <div className="left-panel">
          {!editingState.isEditing && (
            <>
              <h2>Working Condition</h2>

              {routes.length > 0 && renderRouteTabs()}
              {renderActiveRouteDataPoints()}

              <div>{error && <div>{error}</div>}</div>
            </>
          )}
        </div>
        <div className="right-panel">
          <div className="title">
            <h1>Condition Output</h1>
          </div>

          <div className="graph-container">
            <EnergyConsumptionGraph />
          </div>
        </div>
      </div>

      {editingState.isEditing && (
        <PowerDistribution
          conditionData={currentDataPoint || {}}
          onUpdate={handleConditionUpdate}
        />
      )}
    </div>
  );
}

export default WorkingCondition;
