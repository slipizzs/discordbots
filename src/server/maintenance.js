let isMaintenanceMode = false;

module.exports = {
    setMaintenanceMode: (status) => {
        isMaintenanceMode = status;
    },
    isMaintenanceMode: () => {
        return isMaintenanceMode;
    }
};