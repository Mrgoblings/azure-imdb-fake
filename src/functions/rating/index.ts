import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient } from "@prisma/client";
import * as Joi from 'joi';

const prisma = new PrismaClient();

export async function rating(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    switch (request.method) {
        case 'GET':
            return await getRatings();
        case 'POST':
            return await createRating(request);
        case 'PUT':
            return await updateRating(request);
        case 'DELETE':
            return await deleteRating(request);
        default:
            return { status: 405, body: 'Method not supported' };
    }
}

async function getRatings(): Promise<HttpResponseInit> {
    const ratings = await prisma.rating.findMany();
    return { status: 200, body: JSON.stringify(ratings) };
}

async function createRating(request: HttpRequest): Promise<HttpResponseInit> {
    const schema = Joi.object({
        movieId: Joi.number().required(),
        rating: Joi.number().min(1).max(5).required(),
    });

    const { error, value } = schema.validate(request.body);

    if (error) {
        return { status: 400, body: error.details[0].message };
    }

    const newRating = await prisma.rating.create({ data: value });
    return { status: 201, body: JSON.stringify(newRating) };
}

async function updateRating(request: HttpRequest): Promise<HttpResponseInit> {
    const { id } = request.params;
    const schema = Joi.object({
        rating: Joi.number().min(1).max(5).required(),
    });
    const { error, value } = schema.validate(request.body);
    
    if (error) {
        return { status: 400, body: error.details[0].message };
    }

    if(!id) return { status: 400, body: 'Rating ID is required' };

    const { rating } = value;

    const updatedRating = await prisma.rating.update({
        where: { id: Number(id) },
        data: { rating },
    });

    return { status: 200, body: JSON.stringify(updatedRating) };
}

async function deleteRating(request: HttpRequest): Promise<HttpResponseInit> {
    const { id } = request.params;
    if(!id) return { status: 400, body: 'Rating ID is required' };

    await prisma.rating.delete({ where: { id: Number(id) } });

    return { status: 204 };
}

app.http('rating', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    handler: rating
});