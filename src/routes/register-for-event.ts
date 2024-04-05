import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/params";

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/event/:eventID/attendees",
    {
      schema: {
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        params: z.object({
          eventID: z.string().uuid(),
        }),
        response: {
          201: z.object({
            attendeeID: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventID } = request.params;
      const { name, email } = request.body;

      const attendeeFromEmail = await prisma.attendee.findUnique({
        where:{
          eventID_email:{
            email,
            eventID
          }
        }
      })
      
      if( attendeeFromEmail !== null) throw new Error ('This e-mail is already registered for this event.')

      const attendee = await prisma.attendee.create({
        data: {
          name,
          email,
          eventID,
        },
      });

      return reply.status(201).send({ attendeeID: attendee.id });
    }
  );
}
