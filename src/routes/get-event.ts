import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { prisma } from "../lib/prisma";

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventID",
    {
      schema: {
        params: z.object({
          eventID: z.string().uuid(),
        }),
        response: {
          200: {
            event: z.object({
              id: z.string().uuid(),
              tittle: z.string(),
              slug: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().int().nullable(),
              attendeesAmount: z.number().int(),
            }),
          },
        },
      },
    },
    async (request, reply) => {
      const { eventID } = request.params;

      const event = await prisma.event.findUnique({
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          _count: {
            select: {
              Attendee: true,
            },
          },
        },
        where: {
          id: eventID,
        },
      });
      if (event === null) {
        throw new Error("Event not found.");
      }

      return reply.send({
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          details: event.details,
          maximumAttendees: event.maximumAttendees,
          attendeesAmount: event._count.Attendee,
        },
      });
    }
  );
}
