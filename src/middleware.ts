import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';


export const config = {
    runtime: 'nodejs', // Force Node.js runtime
    matcher: ['/api/:path*'],
};

export async function middleware(request: NextRequest) {

    const path = request.nextUrl.pathname;

    const publicPaths = [
        '/api/login',
        '/api/auth',
        '/api/signup',
        '/api/resetpassword',
        '/api/forgetpassword',
        '/api/comparecode',
        '/api/refreshtoken',
    ];


    if (publicPaths.includes(path)) {
        return NextResponse.next(); // Allow access to public paths
    }

    const authorizationHeader = request.headers.get('authorization');
    const token = authorizationHeader?.split(' ')[1];

    if (!token) {
        return new NextResponse(JSON.stringify({
            statusCode: 401,
            message: 'A token is required for authentication.',
        }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }


    try {

        const currentDomain = request.nextUrl.origin;

        const responseData = await axios.post(`${currentDomain}/api/auth`, {}, {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });


        if (responseData.status !== 200) {
            return new NextResponse(JSON.stringify({
                statusCode: 401,
                message: responseData.data.message,
            }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const userId = responseData.data.userId;
        const response = NextResponse.next();
        response.headers.set('userId', userId);
        return response;

    } catch (error: any) {

        return new NextResponse(JSON.stringify({
            statusCode: 401,
            message: error.response?.data?.message || 'Authentication failed',
        }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    }
}

