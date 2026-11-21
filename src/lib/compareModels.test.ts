import { describe, expect, it } from "vitest";
import { compareItems } from "./compareModels";
describe("model comparison", () => {
 it("distinguishes changed attributes from unchanged entities with the same name", () => {
  const old=[{name:"Acme",goals:["Launch"],role:"neutral"}];
  const diff=compareItems(old,[{name:"Acme",goals:["Pause"],role:"neutral"}],e=>e.name);
  expect(diff.changed).toHaveLength(1);expect(diff.unchanged).toHaveLength(0);expect(diff.added).toHaveLength(0);
 });
 it("detects stage changes on an existing arc", () => {
  const diff=compareItems([{name:"Launch",stage:"tension"}],[{name:"Launch",stage:"resolution"}],e=>e.name);
  expect(diff.changed[0].stage).toBe("resolution");
 });
 it("separates additions, removals, and genuinely identical items", () => {
  const diff=compareItems([{name:"A"},{name:"B"}],[{name:"A"},{name:"C"}],e=>e.name);
  expect(diff.added).toEqual([{name:"C"}]);expect(diff.removed).toEqual([{name:"B"}]);expect(diff.unchanged).toEqual([{name:"A"}]);
 });
});
