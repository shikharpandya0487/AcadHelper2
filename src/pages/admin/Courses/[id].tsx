"use client";
import * as React from "react";
import { useState } from "react"
import { Box, Button, TextField, Typography, Modal, Pagination,Select, MenuItem, Chip } from "@mui/material";
import "../../../app/globals.css";
import { useRouter } from "next/router";
import axios from "axios";
import { AdminAuth } from "@/components/AdminAuth";
import Challenge from "@/Interfaces/challenge";
import Assignment from "@/Interfaces/assignment";
import { dummyAssignments, dummyChallenges } from "@/components/SampleData/Sample";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useStore } from "@/store";
import { CldUploadWidget } from "next-cloudinary";
import AssignmentModal from "@/components/AssignmentModal";
import SearchUserModal from "@/components/SearchUser";
import KickUserModal from "@/components/KickUserModal";
import Course from "@/Interfaces/course";
import Auth from '@/components/Auth'
import User from "@/Interfaces/user";
import toast, { Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';
const Layout = dynamic(() => import('@/components/layout'), {
  ssr: false,
});

const AdminPage: React.FC = () => {
  const router = useRouter();
  // Extract a single string ID from the router query (handles string[] case)
  const rawId = router.query.id;
  const courseId: string | undefined = Array.isArray(rawId) ? rawId[0] : rawId;
  const [enrolledUsers,setEnrolledUsers]=React.useState<User[]>([])
  const [openSearch,setOpenSearch]=React.useState<boolean>(false);
  const [openKick,setOpenKick]=React.useState<boolean>(false);
  const [currentAssignmentPage, setCurrentAssignmentPage] = React.useState(1);
  const [currentChallengePage, setCurrentChallengePage] = React.useState(1);
  const [currentUserPage, setCurrentUserPage] = React.useState(1);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [assignments, setassignments] = useState<Assignment[]>([]);
  const [value, setValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [course,setcourse]= useState<Course>()
  const [openAssignment, setopenAssignment] = useState(false);
  const [challengeIdToDelete, setChallengeIdToDelete] = useState<string | null>(
    null
  );
  const [AssignmentIdToDelete, setAssignmentIdToDelete] = useState<
    string | null
  >(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [challengeDoc, setChallengeDoc] = useState("");
  const [type, setType] = useState("individual");
  const [frequency, setFrequency] = useState("daily"); 
  const [points, setPoints] = useState<number | undefined>();
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openUploadAssignmentModal, setOpenUploadAssignmentModal] =
    useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentDoc, setAssignmentDoc] = useState("");
  const [assignmentPoints, setAssignmentPoints] = useState<number | undefined>();
  const [yo, setyo] = useState(false)
  const { user, setUser } = useStore()
  const itemsPerPage = 5;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setCurrentAssignmentPage(1);
    setCurrentChallengePage(1);
    setCurrentUserPage(1);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpload = (result: any) => {
    if (result && result.info) {
      setAssignmentDoc(result.info.url);
      toast.success("Uploaded result");
    } else {
      toast.error("Upload failed or result is invalid.");
    }
  };

  const getcourse=async()=>{
    try{
      const res = await axios.get(`/api/course/${courseId}`);
      setcourse(res.data.course)
    }
    catch(e:any){
      toast.error(e.response.data.error);
    }
  }

  const handleUploadChallenge = (result: any) => {
    if (result && result.info) {
      setChallengeDoc(result.info.url);
      toast.success("Uploaded result info:");
    } else {
      toast.error("Upload failed or result is invalid.");
    }
  };

const handleSubmitChallenge = async () => {
  if(!title || !description || !startDate || !challengeDoc || !type || !frequency || !points){
    toast.error("Required fields cannot be empty")
  }
  if(title.length>100){
    toast.error("Title cannot be greater than 100 characters")
  }
  if(assignmentPoints !== undefined && assignmentPoints > 500){
    toast.error("Points cannot be greater than 500")
  }
  try {
    let End = new Date(startDate);
    if (frequency === "daily") {
      End.setDate(End.getDate() + 1)
    }
    if (frequency === "weekly") {
      End.setDate(End.getDate() + 7)
    }
    const response = await axios.post("/api/challenge/uploadchallenge", {
      title,
      description,
      startDate,
      endDate: End.toISOString().split('T')[0],
      challengeDoc,
      type,
      frequency,
      points,
      createdBy: user?._id,
      courseId,
    });
    setChallenges((prev) => [...prev, response.data.Challenge]);
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setChallengeDoc("");
    setType("individual");
    setFrequency("daily");
    setPoints(undefined);
    setOpenUploadModal(false);
    setyo(!yo)
    toast.success("Challenge uploaded successfully")
  } catch (error:any) {
    toast.error(error.response.data.message)
  }
};

const handleSubmitAssignment = async () => {
  if(title.length>100){
    toast.error("Title cannot be greater than 100 characters")
  }
  if(assignmentPoints !== undefined && assignmentPoints > 500){
    toast.error("Points cannot be greater than 500")
  }
  try {
    const response = await axios.post("/api/assignment/upload-assignment", {
      userId: user?._id,
      title: assignmentTitle,
      description: assignmentDescription,
      DueDate: assignmentDueDate,
      AssignmentDoc: assignmentDoc,
      totalPoints: assignmentPoints,
      CourseId: courseId,
      uploadedAt: Date.now(),
      status: "Open"
    });
    toast.success("Assignment uploaded successfully")
    setAssignmentTitle("");
    setAssignmentDescription("");
    setAssignmentDueDate("");
    setAssignmentDoc("");
    setAssignmentPoints(undefined);
    setOpenUploadAssignmentModal(false);
    setyo(!yo)
  } catch (error:any) {
    toast.error(error.response.data.message)
  }
};

const fetchChallenges = async () => {
  try {
    const response = await axios.get(`/api/challenge/getchallengebycourse?CourseId=${courseId}`);
    setChallenges(response.data.data);
  } catch (error:any) {
    toast.error(error.response.data.error);
  }
};

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `/api/assignment/getassignmentsbycourse?CourseId=${courseId}`
      );
      setassignments(response.data.data);
    } catch (error:any) {
      toast.error(error.response.data.error);
    }
  };

  const fetchEnrolledUsers = async () => {
    try {
      const response = await axios.get("/api/course/get-enrolled", {
        params: {
          courseId,
        },
      });

      setEnrolledUsers(response.data.users);
    } catch (error:any) {
      toast.error(error.response.data.error);
      return;
    }
  };

  const DeleteChallenge = async () => {
    if (challengeIdToDelete) {
      try {
        const response = await axios.delete(
          `/api/challenge/deletechallenge?Id=${challengeIdToDelete}`
        );
        setChallenges((prev) =>
          prev.filter((challenge) => challenge._id !== challengeIdToDelete)
        );
        handleCloseModal();
        toast.success("Deleted challenges");
      } catch (error:any) {
        toast.error(error.response.data.error);
      }
    }
  };
  const DeleteAssignment = async () => {
    if (AssignmentIdToDelete) {
      try {
        const response = await axios.delete(
          `/api/assignment/delete-assignment?Id=${AssignmentIdToDelete}`
        );
        setassignments((prev) =>
          prev.filter((assignment) => assignment._id !== AssignmentIdToDelete)
        );
        handleCloseAssignmentModal();
        toast.success("Deleted Assignment");
      } catch (error:any) {
        toast.error(error.response.data.error);
      }
    }
  };

  const kickOut = async (userData: any) => {
    try {
      const obj = {
        userId: userData?._id,
        courseId,
      };
      const response = await axios.delete("/api/course/kick-user", {
        params: obj,
      });
      fetchEnrolledUsers();
      toast.success("Kicked out the user");
    } catch (error:any) {
      toast.error(error.response.data.error);
    }
  };

  const paginatedAssignments = assignments.slice(
    (currentAssignmentPage - 1) * itemsPerPage,
    currentAssignmentPage * itemsPerPage
  );

  const paginatedChallenges = challenges.slice(
    (currentChallengePage - 1) * itemsPerPage,
    currentChallengePage * itemsPerPage
  );

  const paginatedUsers = enrolledUsers.slice(
    (currentUserPage - 1) * itemsPerPage,
    currentUserPage * itemsPerPage
  );

  const handleAssignmentPageChange = (
    _: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentAssignmentPage(page);
  };

  const handleChallengePageChange = (
    _: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentChallengePage(page);
  };

  const handleUserPageChange = (
    _: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentUserPage(page);
  };

  const handleOpenModal = (id: string) => {
    setChallengeIdToDelete(id);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setChallengeIdToDelete(null);
  };
  const handleOpenAssignmentModal = (id: string) => {
    setAssignmentIdToDelete(id);
    setopenAssignment(true);
  };

  const handleCloseAssignmentModal = () => {
    setopenAssignment(false);
    setAssignmentIdToDelete(null);
  };

  React.useEffect(() => {
    fetchAssignments();
    fetchChallenges();
    fetchEnrolledUsers();
    getcourse();
  }, [courseId,yo]);

  return (
    <Layout>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="Assignments" />
          <Tab label="Challenges" />
          <Tab label="Settings" />
        </Tabs>
        {value === 0 && (
          <>
            <Box sx={{ mt:1 }}>
              <div className="flex flex-end justify-end">
            <Button variant="outlined" color="primary" sx={{ width: '200px',marginX:"2rem" }} onClick={() => setOpenUploadAssignmentModal(true)} >
                Upload Assignment
            </Button>
            </div>
            <AssignmentModal open={open} handleClose={handleClose} courseId={courseId}/>
                          <Box
                          sx={{display:"flex",width:"100%",justifyContent:"center",alignContent:"center",gap:10}}
                          >
                            <Pagination
                             count={Math.ceil(assignments.length / itemsPerPage)}
                             variant="outlined" 
                             color="secondary" 
                              page={currentAssignmentPage}
                              onChange={handleAssignmentPageChange}
                             />
              
              </Box>

              {paginatedAssignments.length > 0 ? (
                        paginatedAssignments.map((assignment) => {
                          const today = new Date()
                          const due = assignment.DueDate ? new Date(assignment.DueDate) : null
                          const status = due && due >= today ? 'Open' : 'Closed';
                          return (
                          <div className="bg-white rounded-lg shadow-lg p-6 w-[95%] m-6 cursor-pointer"  onClick={() => router.push(`/Assignment/admin/${assignment._id}`)}>
                          <h1 className="text-3xl font-bold mb-4 flex justify-between">
                           <div className="truncate w-[80%]">{assignment.title}</div>
                           <div>
                            <Chip label={status} sx={{marginRight:"1rem"}} color={status=='Open' ? "success" : "error"} variant="outlined"/>
                            <Chip label={assignment.totalPoints} />
                            </div>
                           </h1>
                          <p><strong>Assigned on:</strong> {assignment.uploadedAt ? new Date(assignment.uploadedAt).toISOString().split("T")[0] : "N/A"}</p>
                          <p><strong>Due date:</strong> {assignment.DueDate ? new Date(assignment.DueDate).toISOString().split("T")[0] : "N/A"}
                          </p>
                      </div>

                    )})
                ) : (
                    <div className="m-4">
                            No assignments available.
                    </div>
                )}

              <Modal
                open={openUploadAssignmentModal}
                onClose={() => setOpenUploadAssignmentModal(false)}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Add New Assignment
                  </Typography>
                  <TextField
                    fullWidth
                    label="Title"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    label="Description"
                    value={assignmentDescription}
                    onChange={(e) => setAssignmentDescription(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Due Date"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <CldUploadWidget
                    uploadPreset="acad_helper_pdf	"
                    onSuccess={handleUpload}
                  >
                    {({ open }) => (
                      <Button
                        onClick={() => open()}
                        variant="outlined"
                        color="primary"
                        fullWidth
                      >
                        Select File
                      </Button>
                    )}
                  </CldUploadWidget>

                  <TextField
                    fullWidth
                    type="number"
                    label="Points"
                    value={assignmentPoints}
                    onChange={(e) => setAssignmentPoints(parseInt(e.target.value))}
                    sx={{ my: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitAssignment}
                  >
                    Submit Assignment
                  </Button>
                </Box>
              </Modal>
            </Box>
          </>
        )}

        {value === 1 && (
          <>
          <Box>
          <div className="flex justify-end">
          <Button variant="outlined" color="primary" sx={{ width: '200px',marginRight:"2rem" }} onClick={() => setOpenUploadModal(true)}>
                     Add Challenge
          </Button>
          </div>

            <Box sx={{ display: 'flex', justifyContent: 'center',alignContent:"center",gap:10, mb: 2 }}>
                  <Pagination  
                    count={Math.ceil(challenges.length / itemsPerPage)}
                    page={currentChallengePage}
                    onChange={handleChallengePageChange}
                    variant="outlined" 
                    color="secondary" />
            </Box>


              <Modal
                open={openUploadModal}
                onClose={() => setOpenUploadModal(false)}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Add New Challenge
                  </Typography>
                  <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <CldUploadWidget
                    uploadPreset="acad_helper_pdf	"
                    onSuccess={handleUploadChallenge}
                  >
                    {({ open }) => (
            <Button onClick={() => open()} variant="outlined" color="primary" fullWidth sx={{mb:2}}>
              Select File
            </Button>
          )}
                  </CldUploadWidget>
                  <Select
                    fullWidth
                    value={type}
                    onChange={(e) => setType(e.target.value as string)}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="team">Team</MenuItem>
                  </Select>
                  <Select
                    fullWidth
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as string)}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                  <TextField
                    fullWidth
                    type="number"
                    label="Points"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitChallenge}
                  >
                    Submit Challenge
                  </Button>
                </Box>
              </Modal>

            {paginatedChallenges.length > 0 ? (

              paginatedChallenges.map((challenge) => (
                <div className="bg-white rounded-lg shadow-lg p-6 w-[95%] m-6 cursor-pointer" onClick={() => router.push(`/Challenge/${challenge._id}`)}>
                  <h1 className="text-3xl font-bold mb-4 flex justify-between">
                   <div className="truncate w-[80%]">{challenge.title}</div>
                   <div className="flex">
                   <Chip label={challenge.type} sx={{marginRight:"1rem"}} color="secondary" variant="outlined"/>
                    <Chip label={challenge.frequency} sx={{marginRight:"1rem"}} color={challenge.frequency=='daily' ? "primary" : "success"} variant="outlined"/>
                    <Chip label={challenge.points} />
                    </div>
                   </h1>
                  <p><strong>Start date:</strong> {new Date(challenge.startDate).toISOString().split("T")[0]}</p>
                  <p><strong>Due date:</strong> {new Date(challenge.endDate).toISOString().split("T")[0]}</p>
              </div>
              ))
            ) : (
              <div className="m-4">No challenges found for this course.</div>
            )}
          </Box>
          
        </>
        )}

        {/* admin features -> view the users ,making the user admin etc */}
        {value === 2 && (
          <>
          <div className="flex justify-between p-4">
          
          <div>
              <Button
                variant="outlined"
                size="small"
                onClick={()=>setOpenSearch(true)}
                sx={{marginLeft:"1rem",marginRight:"1rem"}}
              >
                Make Admin
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={()=>setOpenKick(true)}
              >
                Remove User
              </Button>
            </div>
            <Typography variant="h6" gutterBottom>
              Course Code: {course?.CourseCode}
            </Typography>
            </div>
            <div className="flex justify-center">
              <Pagination  
              count={Math.ceil(enrolledUsers.length / itemsPerPage)}
              page={currentUserPage}
              onChange={handleUserPageChange} 
              variant="outlined" 
              color="secondary" />
              <SearchUserModal open={openSearch} setOpen={setOpenSearch} courseId={courseId}/>
              <KickUserModal open={openKick} setOpen={setOpenKick} courseId={courseId}/>
            </div>

            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2, mt: 2,padding:"2rem"}}>
              <Typography variant="h5" gutterBottom>
                Enrolled Users
              </Typography>

                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <Box
                      key={user._id}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6">{user.username}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Email: {user.email}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => router.push(`/Profile/${user._id}`)}
                        >
                          View Profile
                        </Button>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No users enrolled in this course.
                  </Typography>
                )}
          </Box>


          
        </>
        )}

        <Modal
          open={open}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 3,
              p: 4,
              outline: "none",
              zIndex: 1300,
            }}
          >
            <Typography
              id="modal-title"
              variant="h6"
              component="h2"
              sx={{ mb: 2 }}
            >
              Confirm Delete
            </Typography>
            <Typography id="modal-description" sx={{ mb: 4 }}>
              Are you sure you want to delete this challenge?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCloseModal} color="primary" sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button
                onClick={DeleteChallenge}
                variant="contained"
                color="secondary"
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal
          open={openAssignment}
          onClose={handleCloseAssignmentModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 3,
              p: 4,
              outline: "none",
              zIndex: 1300,
            }}
          >
            <Typography
              id="modal-title"
              variant="h6"
              component="h2"
              sx={{ mb: 2 }}
            >
              Confirm Delete
            </Typography>
            <Typography id="modal-description" sx={{ mb: 4 }}>
              Are you sure you want to delete this assignment?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={handleCloseAssignmentModal}
                color="primary"
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                onClick={DeleteAssignment}
                variant="contained"
                color="secondary"
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>
        <Toaster/>
      </Box>
    </Layout>
  );
};

export default AdminAuth(AdminPage);