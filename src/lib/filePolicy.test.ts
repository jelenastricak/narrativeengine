import { describe, expect, it } from "vitest";
import { fileValidationError, MAX_FILE_BYTES, SUPPORTED_TYPES } from "../../supabase/functions/_shared/filePolicy";
import { validateDocxArchive } from "../../supabase/functions/_shared/validateDocx";
import { MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "./normalizeModel";
describe("document limits", () => {
 it("accepts the supported formats regardless of filename case", () => {
  for (const extension of ["txt","md","json","csv","html","xml","pdf","docx"]) expect(fileValidationError({name:`Report.${extension.toUpperCase()}`,size:100})).toBeNull();
  expect(SUPPORTED_TYPES).not.toContain(".doc");
 });
 it("enforces the 10MB upload limit", () => {
  expect(MAX_FILE_BYTES).toBe(10*1024*1024);
  expect(fileValidationError({name:"report.txt",size:MAX_FILE_BYTES})).toBeNull();
  expect(fileValidationError({name:"report.txt",size:MAX_FILE_BYTES+1})).not.toBeNull();
 });
 it("rejects empty and unsupported files", () => {
  expect(fileValidationError({name:"report.txt",size:0})).not.toBeNull();
  expect(fileValidationError({name:"report.exe",size:100})).not.toBeNull();
  expect(fileValidationError({name:"report.doc",size:100})).not.toBeNull();
 });
 it("preserves the 20 to 100000 character analysis limits", () => {
  expect(MIN_INPUT_CHARS).toBe(20); expect(MAX_INPUT_CHARS).toBe(100000);
 });
 it("rejects oversized DOCX archives before expanding them", () => {
  const bytes=new ArrayBuffer(68);const view=new DataView(bytes);
  view.setUint32(0,0x02014b50,true); view.setUint32(24,41*1024*1024,true);
  view.setUint32(46,0x06054b50,true); view.setUint16(56,1,true); view.setUint32(62,0,true);
  expect(()=>validateDocxArchive(bytes)).toThrow(/safe document limit/);
 });
 it("rejects corrupt DOCX archives", () => { expect(()=>validateDocxArchive(new ArrayBuffer(30))).toThrow(); });
});
