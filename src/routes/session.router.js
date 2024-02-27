import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, getCurrentUser } from '../controllers/session.controller.js';

const sessionRouter = express.Router();


sessionRouter.get('/github', passport.authenticate('github',{scope:['user:email']}),async(req,res)=>{});
sessionRouter.get('/githubcallback', passport.authenticate('github',{failureRedirect:'/login'}),async(req,res)=>{
    req.session.user = req.user;
    res.redirect('/');
});
sessionRouter.get('/current', getCurrentUser);
sessionRouter.post('/register', registerUser);
sessionRouter.post('/login', loginUser);

export default sessionRouter;
