### harexs-store

> Easily load and persist config(study for configstore)

### Install
> npm install harexs-store

### Usage

```javascript
import harexsStore from "harexs-store";

const harexsStore = store("harexs");

harexsStore.set("js.ts.go", [1, 2, 3]);

console.log(harexsStore.get("js.ts.go")); //=>[1, 2, 3]

console.log(harexsStore.has("js.ts")); //=> true

harexsStore.remove("js.ts.go");

console.log(harexsStore.get("js.ts.go")); //=>undefined

harexsStore.clear();

console.log(harexsStore.get("js")); //=>undefined

harexsStore.set("js.ts", [1, 2, 3]);

console.log(harexsStore.get("js.ts")); //=>[1, 2, 3]
```
