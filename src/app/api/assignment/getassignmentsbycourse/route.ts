import Challenge from "@/models/challengeModel";
import User from "@/models/userModel";
import Course from "@/models/courseModel";
import Assignment from "@/models/assignmentModel";
import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConfig/dbConfig";

connect()

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const CourseId = url.searchParams.get('CourseId');
        if(!CourseId){
            return NextResponse.json({
                success: false,
                message: "Invalid CourseId",
            }, { status: 404 });
        }
        const course = await Course.findById(CourseId)
        if(!course){
            return NextResponse.json({
                success: false,
                message: "Course not found",
            }, { status: 404 });
        }
        const assignments = await Assignment.find({_id: { $in: course.assignments } });      //finding assignments which belongs to this course
        return NextResponse.json({
            success: true,
            data: assignments,
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: "Failed to fetch assignments.",
            error: error.message,
        }, { status: 500 });
    }
}