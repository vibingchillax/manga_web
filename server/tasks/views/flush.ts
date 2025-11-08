import { flushViews } from "~~/server/utils/viewCount";

export default defineTask({
  meta: {
    name: "views:flush",
    description: "Flush view count",
  },
  async run() {
    await flushViews();
    return {
      result: "ok",
    };
  },
});
