"use client"
import * as React from 'react';
import { useState } from 'react';
import Popover from '@mui/material/Popover';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { useStore } from '@/store';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import axios from 'axios';
import toast from 'react-hot-toast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Notification() {
  const {user,setUser} = useStore() as any;
  const inbox: any[] = user?.inbox ?? [];

  const [invitationStatus, setInvitationStatus] = useState<{ [key: string]: 'pending' | 'accepted' | 'rejected' }>({});
  
  const handleInvite = async(approval:Boolean,mail:any)=>{
      try{
        const {data} = await axios.post("/api/team/invitation",{approval,userId:user?._id,teamId:mail.teamId,mail})
        toast.success(data.message)
        setInvitationStatus((prevState) => ({
          ...prevState,
          [mail.teamId]: approval ? 'accepted' : 'rejected',
        }));
      }catch(e:any){
        toast.error(e.response.data.error)
      }
  }

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleDelete = async(notificationId: any)=>{
    if (!user) return;
    try{
      const {data} = await axios.delete("/api/notification",{params:{userId:user._id,notificationId}})
      if(data.success){
        setUser(data.updatedUser)
      }
    }catch(error:any){
      toast.error(error.response.data.error)
    }
  }

  return (
    <div>
      <IconButton size="large" color="inherit" onClick={handleClick}>
              <Badge badgeContent={inbox.length} color="error">
                <NotificationsIcon />
              </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {inbox.length > 0 ? inbox.map((notif:any)=>(
            <ListItem>
            <ListItemAvatar>
            <Avatar>
                <GroupsIcon />
            </Avatar>
            </ListItemAvatar>
            <ListItemText primary={notif.message} secondary={new Date(notif.date).toISOString().split('T')[0]}/>
            {notif.type == "group invite" && <div>
              {invitationStatus[notif.teamId] === 'accepted' ? (
                    <CheckCircleIcon color="success" />
                  ) : invitationStatus[notif.teamId] === 'rejected' ? (
                    <CancelOutlinedIcon color="error" />
                  ) : (
                    <>
                      <CheckCircleOutlineIcon
                        color="success"
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleInvite(true, notif)}
                      />
                      <CancelOutlinedIcon
                        color="error"
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleInvite(false, notif)}
                      />
                    </>
                  )}
            </div>}
            <DeleteIcon sx={{cursor:"pointer"}} onClick={()=>handleDelete(notif._id)}/>
          </ListItem>
        )):(
          <div>
            You have no notifications
          </div>
        )}
    </List>
      </Popover>
    </div>
  );
}
