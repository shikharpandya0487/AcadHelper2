import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Submission from "@/Interfaces/submission";
import User from "@/Interfaces/user";
import Auth from '@/components/Auth'
import toast from "react-hot-toast";

const SubmissionDetails: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [user, setuser] = useState<User | null>(null);

    async function fetchUser(userId: string) {
        try {
            const response = await axios.get(`/api/user?Id=${userId}`);
            if (response.data.success) {
                return response.data.data;
            } else {
                return null;
            }
        } catch (error:any) {
            toast.error(error.response.data.error)
            return null;
        }
    }
    useEffect(() => {
        if (id) {
            const fetchSubmission = async () => {
                try {
                    const response = await axios.get(`/api/submission?Id=${id}`);
                    const fetchedSubmission = response.data.data;
                    setSubmission(fetchedSubmission);
                    if (fetchedSubmission.User) {
                        try {
                            const response = await axios.get(`/api/user?Id=${fetchedSubmission.User}`);
                            if (response.data.success) {
                                setuser(response.data.data);
                            } else {
                                toast.error(response.data);
                            }
                        }
                        catch (err:any) {
                            toast.error(err.response.data.error)
                        }
                    }
                } catch (error:any) {
                    toast.error(error.response.data.error)
                }
            };
            fetchSubmission();
        }
    }, [id]);

    if (!submission) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center bg-gray-100 min-h-screen py-10 px-5">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-4">Submission Details</h1>
                <p><strong>Submitted By:</strong> {user?.username}</p>
                <p><strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                <p><strong>Verified:</strong> {submission.isVerified ? "Yes" : "No"}</p>
                <p><strong>Marks Obtained:</strong> {submission.marksObtained ?? "N/A"}</p>
                <p><strong>Feedback:</strong> {submission.feedback ?? "N/A"}</p>
                <a href={submission.documentLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    View Document
                </a>
            </div>
        </div>
    );
};

export default Auth(SubmissionDetails);
