import fs from "node:fs";

function isObject(obj: Record<string, any>) {
  return obj !== null && typeof obj === "object";
}

export function initData(Path: string) {
  if (fs.existsSync(Path)) {
    return JSON.parse(fs.readFileSync(Path, "utf8"));
  }
  return {};
}

export function splitSet(obj: Record<string, any>, key: string, val: any) {
  let allKey = key.split(".");
  for (let i = 0; i < allKey.length; i++) {
    let key = allKey[i];
    let keyVal = obj[key];

    // 没到最后一项遍历就不存在则初始化这个对象
    if (!isObject(keyVal)) obj[key] = {};
    if (i === allKey.length - 1) obj[key] = val;
    obj = obj[key];
  }
}
export function splitGet(obj: Record<string, any>, key: string) {
  let allKey = key.split(".");

  for (let i = 0; i < allKey.length; i++) {
    let key = allKey[i];
    let keyVal = obj[key];
    //找到不为对象的值 则提前终止
    if (!isObject(keyVal) && i > 0) return obj[key];
    obj = obj[key];
  }
  return obj;
}

export function splitRemove(obj: Record<string, any>, key: string) {
  let allKey = key.split(".");

  for (let i = 0; i < allKey.length; i++) {
    let key = allKey[i];
    let keyVal = obj[key];
    //找到不为对象的值 则提前终止
    if (!isObject(keyVal) && i > 0) return delete obj[key];
    if (i === allKey.length - 1) delete obj[key];
    obj = obj[key];
  }
}
