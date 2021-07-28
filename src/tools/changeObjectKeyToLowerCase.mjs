export default function changeObjectKeyToLowerCase(object) {
  return Object.keys(object).reduce((accu, key) => {
    accu[key.toLowerCase()] = object[key];
    return accu;
  }, {});
}
