import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { prisma } from "../lib/params";

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventID",
    {
      schema: {
        params: z.object({
          eventID: z.string().uuid(),
        }),
        response: {},
      },
    },
    async (request, reply) => {
      const { eventID } = request.params;

      const event = await prisma.event.findUnique({
        where: {
          id: eventID,
        },
      });
      if (event === null) {
        throw new Error("Event not found.");
      }

      return reply.send({ event });
    }
  );
}
