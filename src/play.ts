import store from "./index";

const test = store("test");
test.set("bbq.abc.go", 123);
const q = test.get("bbq.abc.go");

console.log(q);
