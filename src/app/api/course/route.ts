import { connect } from '@/dbConfig/dbConfig';
import Course from '@/models/courseModel'
import User from '@/models/userModel';
import Assignment from '@/models/assignmentModel';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

connect()

//GET all courses from user id
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if(!userId){
            return NextResponse.json({ error: 'Please Login first' }, { status: 400 })
        }
        const user = await User.findOne({ _id: userId })

        if (!user) {
            return NextResponse.json({ error: 'User does not exist' }, { status: 400 })
        }

        const courseList = user.Courses.map((course: { courseId: mongoose.Schema.Types.ObjectId, enrolledAt: Date }) => { return course.courseId })
        const courses = await Course.find({ _id: { $in: courseList } }).select('_id name')
        return NextResponse.json({ courses, success: true })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

//Join course using course code
export async function POST(request: NextRequest) {
    try {
        const { code, userId } = await request.json()
        const courseExist = await Course.findOne({ CourseCode: code })

        if (!courseExist) {
            return NextResponse.json({ error: "Course code is invalid" }, { status: 400 })
        }

        const userExist = await User.findById(userId)
        if (!userExist) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 })
        }
        //checking if user has already joined the course

        if (userExist.Courses.includes(courseExist._id)) return NextResponse.json({ error: "You have already joined this course" }, { status: 400 })

        //checking if user is admin
        
        if(userExist.CoursesAsAdmin.includes(courseExist._id)) {
            return NextResponse.json({ error: "You are an admin of this course and cannot join as a student." }, { status: 400 });
        }
        const course = await Course.findOneAndUpdate({ CourseCode: code }, { $push: { StudentsEnrolled: userId } }, { new: true })

        const user = await User.findByIdAndUpdate(userId, { $push: { Courses: { courseId: course._id, enrolledAt: new Date() } } }, { new: true })

        return NextResponse.json({ message: "Course joined successfully", success: true })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// delete course
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("Id");
        if (!courseId) {
            return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }
        const users = course.StudentsEnrolled
        for (const user of users) {
            const assignments = await Assignment.find({ Course: courseId });
            const assignmentIds = assignments.map(assignment => assignment._id);

            await User.findByIdAndUpdate(
                user,
                {
                    $pull: {
                        pendingAssignments: { assignmentId: { $in: assignmentIds } }
                    }
                }
            );
        }
        await Course.findByIdAndDelete(courseId);
        return NextResponse.json({ message: "Course and related data deleted successfully" }, { status: 200 });
    }
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}