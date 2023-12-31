import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import { initData, splitSet, splitGet, splitRemove } from "./utils";
import type { OptionsType } from "./type";

let Path = path.join(os.homedir(), ".harexsStore.json"); //默认用户目录下的指定文件
const getFileErrorMessage = "读取存储文件失败";

export default function harexsStore(
  id: string,
  defaultsObj?: Record<string, any>,
  options?: OptionsType
) {
  //指定ID文件
  Path = path.join(os.homedir(), `${id}.json`);
  // 如果用户有指定默认目录
  if (options?.pathPrefix)
    Path = path.join(os.homedir(), options!.pathPrefix, `${id}.json`);
  if (options?.configPath) Path = path.join(options!.configPath, `${id}.json`);

  //初始化对象
  let _all = initData(Path);

  // 劫持对象夹子
  let allProxy = new Proxy(_all, {
    get(target: Record<string, any>, key: string) {
      try {
        let obj = JSON.parse(fs.readFileSync(Path, "utf8"));
        //分割判断返回
        return splitGet(obj, key);
      } catch (err: any) {
        //文件不存在
        if (err.code === "ENOENT") {
          return {};
        }
        if (err.name === "SyntaxError") {
          fs.writeFileSync(Path, "", "utf-8");
          return {};
        }
        err.message = getFileErrorMessage;
        throw err;
      }
    },
    set(target: Record<string, any>, key: string, val: any, receiver: any) {
      try {
        //如果是目录不存在 创建对应目录
        if (!fs.existsSync(path.dirname(Path))) {
          fs.mkdirSync(path.dirname(Path), { mode: 0o0700, recursive: true });
        }
        //如果文件不存在 创建对应文件并写入内容
        if (!fs.existsSync(Path)) {
          fs.writeFileSync(Path, "{}", "utf-8");
        }

        //读出整个对象
        let obj = JSON.parse(fs.readFileSync(Path, "utf8"));
        //分割处理
        splitSet(obj, key, val);
        //重新存储整个对象
        fs.writeFileSync(Path, JSON.stringify(obj, null, "\t"));
        return true;
      } catch (err: any) {
        err.message = getFileErrorMessage;
        throw err;
      }
    },
  });

  for (const key in defaultsObj) {
    allProxy[key] = defaultsObj[key];
  }

  const get = (key: string) => allProxy[key];

  const set = (key: string, val: any) => (allProxy[key] = val);

  const has = (key: string) => !!allProxy[key];

  const remove = (key: string) => {
    let obj = JSON.parse(fs.readFileSync(Path, "utf8"));
    splitRemove(obj, key);
    fs.writeFileSync(Path, JSON.stringify(obj, null, "\t"));
    return true;
  };

  const clear = () => (allProxy = Object.create(null));

  return {
    get,
    set,
    has,
    remove,
    clear,
  };
}
