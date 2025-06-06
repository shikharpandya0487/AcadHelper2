import Challenge from "@/models/challengeModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import {connect} from '@/dbConfig/dbConfig'

// get challenges by challengeId
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const Id = url.searchParams.get('Id');
        await connect()
        if(!Id){
            return NextResponse.json({
                success: false,
                message: "Invalid Id",
            }, { status: 400 });
        }
        const chal = await Challenge.findById(Id);
        console.log(Id)
        if(!chal){
            return NextResponse.json({
                success: false,
                message: "Challenge not found",
            }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            data: chal,
        });
    } catch (error: any) {
        console.error("Error fetching challenges:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch challenges.",
            error: error.message,
        }, { status: 500 });
    }
}