import { remark } from "remark";
import strip from "strip-markdown";

export async function markdownToText(md: string) {
  const file = await remark().use(strip).process(md);
  return String(file).trim();
}
