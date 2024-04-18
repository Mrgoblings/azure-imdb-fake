import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Prisma, PrismaClient } from "@prisma/client";
import * as Joi from 'joi';

const prisma = new PrismaClient();

export async function thumbnail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    switch (request.method) {
        case 'GET':
            return await getThumbnail(request);
        case 'PUT':
            return await updateThumbnail(request);
        case 'DELETE':
            return await deleteThumbnail(request);
        default:
            return { status: 405, body: 'Method Not Allowed' };
    }
}

async function getThumbnail(request: HttpRequest): Promise<HttpResponseInit> {
    try {
        const movieId = parseInt(request.query.get("id") || "");
        if(!movieId) return { status: 400, body: 'Movie ID is required' };

        const movie = await prisma.movie.findUnique({ where: { id: movieId }, select: { thumbnailUrl: true } });
        return { body: JSON.stringify(movie?.thumbnailUrl) };
    } catch (error) {
        return { status: 500, body: "Internal Server Error" };
    }
}

async function updateThumbnail(request: HttpRequest): Promise<HttpResponseInit> {
    try {
        const movieId = parseInt(request.query.get("id") || "");
        if(!movieId) return { status: 400, body: 'Movie ID is required' };

        const thumbnailUrl: string = await Joi.string().uri().validateAsync(request.body);
        const movie = await prisma.movie.update({ where: { id: movieId }, data: { thumbnailUrl } });
        return { body: JSON.stringify(movie.thumbnailUrl) };
    } catch (error) {
        return { status: 500, body: "Internal Server Error" };
    }
}

async function deleteThumbnail(request: HttpRequest): Promise<HttpResponseInit> {
    try {
        const movieId = parseInt(request.query.get("id") || "");
        if(!movieId) return { status: 400, body: 'Movie ID is required' };

        const movie = await prisma.movie.update({ where: { id: movieId }, data: { thumbnailUrl: null } });
        return { status: 204 };
    } catch (error) {
        return { status: 500, body: "Internal Server Error" };
    }
}

app.http('thumbnail', {
    methods: ['GET', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    handler: thumbnail
});