import { Add, RateReview, Check, Clear, CheckCircle, Warning } from "@mui/icons-material";
import { Avatar, Box, Button, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText, IconButton, Paper, TextField, Typography } from "@mui/material";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import ButtonBox from "../../components/buttonBox/buttonBox";

function Review(props) {
    const user = localStorage.getItem('user');
    const { brief } = props;
    const [review, setReview] = useState(brief.review || {
        comments: []
    });
    const { reviewLink, comments } = review;
    const [displayLinkForm, setDisplayLinkForm] = useState(false);
    const [newLink, setNewLink] = useState('');
    const [newComment, setNewComment] = useState({})
    const [displayCommentForm, setDisplayCommentForm] = useState(false);

    function saveLink() {
        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${brief.id}`, {
            review: {
                ...review,
                reviewLink: newLink
            },
            history: [
                {
                    "action": `Review link added by ${user}`,
                    "date": new Date().getTime(),
                    "user": user,
                    "id": uuidv4()
                },
                ...brief.history
            ]
        }).then(() => {
            setDisplayLinkForm(false);
            setNewLink('');
            setReview({
                ...review,
                reviewLink: newLink
            })
        })
    }

    function saveComment() {
        let comments = review.comments || [];
        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${brief.id}`, {
            review: {
                ...review,
                comments: [{
                    ...newComment,
                    date: new Date().getTime(),
                    user: user
                }, ...comments]
            },
            history: [
                {
                    "action": `Review comment added by ${user}`,
                    "date": new Date().getTime(),
                    "user": user,
                    "id": uuidv4()
                },
                ...brief.history
            ]
        }).then(() => {
            setDisplayCommentForm(false);
            setNewComment({
                date: '',
                user: '',
                comment: '',
                id: uuidv4()
            })
            setReview({
                ...review,
                comments: [{
                    ...newComment,
                    date: new Date().getTime(),
                    user: user
                }, ...comments]
            })
        })
    }

    return(
        <Paper sx={{p: 2}}>
            <Grid container>
                <Grid item xs={6}>
                    <Box sx={{mb: 2}}>
                        <RateReview sx={{verticalAlign: 'middle', mr: 1}} /> Project Review
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
                        {review.status && review.status === 'approved' &&
                             <Box sx={{color: '#2e7d32'}}>
                                <CheckCircle sx={{verticalAlign: 'middle', mr: 1}} color='success' /> Approved
                            </Box>
                        }
                        {review.status && review.status === 'revision' &&
                             <Box sx={{color: '#ed6c02'}}>
                                <Warning sx={{verticalAlign: 'middle', mr: 1}} color='warning' /> Needs Revision
                            </Box>
                        }
                    </Box>
                </Grid>
            </Grid>

            <Grid container>
                <Grid item xs={2} my='auto'>
                    <Typography variant='body2'>Review Link:</Typography>
                </Grid>
                <Grid item xs={10} my='auto'>
                    {reviewLink && 
                        <Typography 
                            variant='body2'
                            component='a'
                            href={reviewLink}
                            target='_blank'
                            rel='noreferrer'
                        >
                            {reviewLink}
                        </Typography>
                    }

                    {!reviewLink && !displayLinkForm &&
                        <Button
                            sx={{fontSize: '12px'}}
                            startIcon={<Add />}
                            onClick={() => setDisplayLinkForm(true)}
                        >
                            add link
                        </Button>
                    }

                    {!reviewLink && displayLinkForm &&
                        <>
                            <TextField
                                size='small'
                                value={newLink}
                                onChange={(e) => setNewLink(e.target.value)}
                                sx={{width: '300px'}}
                                label='Link to Review'
                            />
                            <IconButton
                                color='success'
                                sx={{mx: 1}}
                                onClick={saveLink}
                            >
                                <Check />
                            </IconButton>
                            <IconButton
                                color='error'
                                onClick={() => {
                                    setDisplayLinkForm(false);
                                    setNewLink('');
                                }}
                            >
                                <Clear />
                            </IconButton>
                        </>
                    }
                </Grid>
            </Grid>

            <Divider sx={{my: 2}} />

            <Grid container>
                <Grid item xs={2} my='auto'>
                    <Typography variant='body2'>Comments:</Typography>
                </Grid>
                <Grid item xs={10} my='auto'>
                    {!displayCommentForm &&
                        <Button
                            sx={{fontSize: '12px'}}
                            startIcon={<Add />}
                            onClick={() => setDisplayCommentForm(true)}
                        >
                            add comment
                        </Button>
                    }

                    {displayCommentForm &&
                        <ButtonBox>
                            <IconButton
                                color='success'
                                sx={{mx: 1}}
                                onClick={saveComment}
                            >
                                <Check />
                            </IconButton>
                            <IconButton
                                color='error'
                                onClick={() => {
                                    setDisplayCommentForm(false);
                                    setNewComment({
                                        date: '',
                                        user: '',
                                        comment: ''
                                    })
                                }}
                            >
                                <Clear />
                            </IconButton>
                        </ButtonBox>
                    }
                </Grid>
            </Grid>

            
            {displayCommentForm &&
                <TextField
                    value={newComment.comment || ''}
                    multiline
                    fullWidth
                    minRows={5}
                    sx={{mt: 1}}
                    onChange={(e) => setNewComment({
                        ...newComment,
                        comment: e.target.value
                    })}
                />
            }

            {review.comments && review.comments.length > 0 &&
                <List sx={{mb: 3}}>
                    {review.comments.map(comment => {
                        return (
                            <ListItem alignItems='flex-start' key={comment.id} sx={{px: 0}}>
                                <ListItemAvatar>
                                    <Avatar alt={comment.user} src={comment.avatar} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={new Date(comment.date).toLocaleDateString()}
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {comment.user}
                                            </Typography>
                                            {` — ${comment.comment}`}
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                        )
                    })}
                </List>
            }

        </Paper>
    )
}

export default Review;