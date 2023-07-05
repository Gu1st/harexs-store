import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";

const harexsDir = path.join(os.homedir(), ".harexsStore.json"); //默认用户目录下的指定文件
const getFileErrorMessage = "读取存储文件失败";

interface OptionsType {
  configPath?: string;
  pathPrefix?: string;
}

export default function harexsStore(
  id: string,
  defaultsObj?: Record<string, any>,
  options?: OptionsType
) {
  let Path = "";
  let _all = {};

  // 如果用户有指定默认目录
  Path = harexsDir;
  if (options?.pathPrefix)
    Path = path.join(os.homedir(), options!.pathPrefix, `${id}.json`);
  if (options?.configPath) Path = path.join(options!.configPath, `${id}.json`);

  // 劫持对象夹子
  let allProxy = new Proxy(_all, {
    get(target: Record<string, any>, key: string) {
      try {
        const obj = JSON.parse(fs.readFileSync(Path, "utf8"));
        return Reflect.get(obj, key);
      } catch (err: any) {
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
        const obj = JSON.parse(fs.readFileSync(Path, "utf8"));
        //修改某个属性
        Reflect.set(obj, key, val);
        Reflect.set(target, key, val);
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

  const has = (key: string) => allProxy[key];

  const remove = (key: string) => delete allProxy[key];

  const clear = () => (allProxy = Object.create(null));

  return {
    all: allProxy,
    get,
    set,
    has,
    remove,
    clear,
  };
}
