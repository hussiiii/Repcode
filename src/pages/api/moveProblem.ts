import prisma from "../../../prisma_client";
import authenticate from "../../auth/Authenticate";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: any, res: any) {
  authenticate(req, res, async () => {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { problemId, targetCollectionId } = req.body;

    if (!problemId || !targetCollectionId) {
      return res.status(400).json({ error: "problemId and targetCollectionId are required" });
    }

    try {
      const parsedProblemId = parseInt(problemId, 10);
      const parsedTargetCollectionId = parseInt(targetCollectionId, 10);

      const userObject = await prisma.user.findUnique({
        where: {
          email: req.user?.email as string,
        },
      });

      if (!userObject) {
        return res.status(404).json({ error: "User not found" });
      }

      const problem = await prisma.problem.findUnique({
        where: { id: parsedProblemId },
        include: { collection: true },
      });

      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }

      if (problem.collection.userId !== userObject.id) {
        return res.status(403).json({ error: "Forbidden: You do not own this problem" });
      }

      const targetCollection = await prisma.collection.findUnique({
        where: { id: parsedTargetCollectionId },
      });

      if (!targetCollection) {
        return res.status(404).json({ error: "Target collection not found" });
      }

      if (targetCollection.userId !== userObject.id) {
        return res.status(403).json({ error: "Forbidden: You do not own target collection" });
      }

      if (problem.collectionId === parsedTargetCollectionId) {
        return res.status(400).json({ error: "Problem is already in that collection" });
      }

      const updatedProblem = await prisma.problem.update({
        where: { id: parsedProblemId },
        data: { collectionId: parsedTargetCollectionId },
      });

      console.log("CALLED: /moveProblem");
      return res.status(200).json(updatedProblem);
    } catch (error) {
      console.error("Failed to move problem:", error);
      return res.status(500).json({ error: "Failed to move problem" });
    }
  });
}
