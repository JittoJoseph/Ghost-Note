import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, sum, count, desc } from "drizzle-orm";
import { links, submissions } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { Env } from "../env";

const dashboardRouter = new Hono<Env>();

dashboardRouter.use("*", authMiddleware);

dashboardRouter.get("/stats", async (c) => {
  const user = c.get("user");
  const db = drizzle(c.env.DB);

  try {
    // 1. Total links
    const totalLinksResult = await db
      .select({ value: count() })
      .from(links)
      .where(eq(links.userId, user.sub))
      .get();

    // 2. Total visits
    const totalVisitsResult = await db
      .select({ value: sum(links.visitCount) })
      .from(links)
      .where(eq(links.userId, user.sub))
      .get();

    // 3. Total submissions
    const totalSubmissionsResult = await db
      .select({ value: count() })
      .from(submissions)
      .innerJoin(links, eq(submissions.linkId, links.id))
      .where(eq(links.userId, user.sub))
      .get();

    return c.json({
      totalLinks: totalLinksResult?.value || 0,
      totalVisits: Number(totalVisitsResult?.value || 0),
      totalSubmissions: totalSubmissionsResult?.value || 0,
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

dashboardRouter.get("/submissions", async (c) => {
  const user = c.get("user");
  const db = drizzle(c.env.DB);

  try {
    const userSubmissions = await db
      .select({
        id: submissions.id,
        message: submissions.message,
        createdAt: submissions.createdAt,
        link: {
          slug: links.slug,
        },
      })
      .from(submissions)
      .innerJoin(links, eq(submissions.linkId, links.id))
      .where(eq(links.userId, user.sub))
      .orderBy(desc(submissions.createdAt))
      .all();

    return c.json({ submissions: userSubmissions });
  } catch (error) {
    return c.json({ error: "Failed to fetch submissions" }, 500);
  }
});

dashboardRouter.get("/links", async (c) => {
  const user = c.get("user");
  const db = drizzle(c.env.DB);

  try {
    const userLinks = await db
      .select({
        id: links.id,
        slug: links.slug,
        createdAt: links.createdAt,
        isUsed: links.isUsed,
        visitCount: links.visitCount,
        submissionId: submissions.id,
        submissionMessage: submissions.message,
        submissionCreatedAt: submissions.createdAt,
      })
      .from(links)
      .leftJoin(submissions, eq(submissions.linkId, links.id))
      .where(eq(links.userId, user.sub))
      .orderBy(desc(links.createdAt))
      .all();

    const formattedLinks = userLinks.map((row) => ({
      id: row.id,
      slug: row.slug,
      createdAt: row.createdAt,
      isUsed: row.isUsed,
      visitCount: row.visitCount,
      submission: row.submissionId
        ? {
            id: row.submissionId,
            message: row.submissionMessage,
            createdAt: row.submissionCreatedAt,
          }
        : null,
    }));

    return c.json({ links: formattedLinks });
  } catch (error) {
    return c.json({ error: "Failed to fetch links" }, 500);
  }
});

export default dashboardRouter;
