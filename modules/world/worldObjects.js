export const objects = [];

export function getObjectByThree(threeObject) {
    return objects.find(obj => obj.threeMesh.uuid == threeObject.uuid);
}

export function getObjectByCannon(cannonBody) {
    return objects.find(obj => obj.cannonBody == cannonBody);
}